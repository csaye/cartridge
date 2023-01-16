import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import styles from '../styles/components/Screen.module.scss';
import getCanvasContext from '../util/getCanvasContext';
import { getMouseIndex } from '../util/mouse';
import { screenPixels, screenTiles, tilePixels } from '../util/units';
import IconButton from './IconButton';
import Tilebar from './Tilebar';
import Toolbar from './Toolbar';

let container: HTMLDivElement;
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let sketching = false;
let keys: { [key: string]: boolean } = {};
let player = { x: 0, y: 0, xVel: 0, yVel: 0, xAcc: 0, yAcc: -10, facing: 1 };
let grounded = true;

const mapTiles = screenTiles * screenTiles;
const eraserIndex = 0;
const skullIndex = 5;
const startFlagIndex = 6;
const endFlagIndex = 7;

// set default tilemaps
const defaultTiles = Array(screenTiles * 4).fill(-1)
  .concat([-1, startFlagIndex, -1, -1, -1, -1, endFlagIndex, -1])
  .concat(Array(screenTiles).fill(3))
  .concat(Array(screenTiles * 2).fill(2));

let oldMapWidth: number;
let oldMapHeight: number;

const tileNames = [
  'Eraser', 'Tile 1', 'Tile 2', 'Tile 3', 'Tile 4',
  'Skull', 'Start Flag', 'End Flag'
];

type ImageMap = { [path: string]: HTMLImageElement };

export default function Screen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [hoverIndex, setHoverIndex] = useState(-1);
  const [tileHoverIndex, setTileHoverIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tiles, setTiles] = useState(defaultTiles);
  const [playing, setPlaying] = useState(false);

  const [mapWidth, setMapWidth] = useState(1);
  const [mapHeight, setMapHeight] = useState(1);
  const [mapX, setMapX] = useState(0);
  const [mapY, setMapY] = useState(0);

  const [images, setImages] = useState<ImageMap>();

  const tilesWidth = mapWidth * screenTiles;
  const tilesHeight = mapHeight * screenTiles;

  // initialize images
  useEffect(() => {
    const imagePaths = ['tiles', 'player'];
    let loadedCount = 0;
    let imageMap: ImageMap = {};
    // for each image path
    for (const path of imagePaths) {
      // load path and increment count
      imageMap[path] = new Image();
      imageMap[path].src = `/img/sprites/${path}.png`;
      imageMap[path].onload = () => {
        loadedCount++;
        if (loadedCount === imagePaths.length) setImages(imageMap);
      }
    }
  }, []);

  // get canvas context on start
  useEffect(() => {
    if (!containerRef.current) throw 'no container';
    container = containerRef.current;
    [canvas, ctx] = getCanvasContext(canvasRef);
    ctx.imageSmoothingEnabled = false;
  }, []);

  // returns tile index for given mouse event
  function getTileIndex(e: MouseEvent) {
    const mouseIndex = getMouseIndex(e, canvas, tilePixels, screenTiles, container);
    const mouseX = mouseIndex % screenTiles;
    const mouseY = Math.floor(mouseIndex / screenTiles);
    const tileX = mapX * screenTiles + mouseX;
    const tileY = (mapHeight - 1 - mapY) * screenTiles + mouseY;
    return tileY * tilesWidth + tileX;
  }

  // resets player
  const resetPlayer = useCallback(() => {
    const start = tiles.indexOf(startFlagIndex);
    const startX = start === -1 ? 0 : start % tilesWidth;
    const startY = start === -1 ? 0 : Math.floor(start / tilesWidth);
    player = {
      x: startX * tilePixels, y: startY * tilePixels,
      xVel: 0, yVel: 0, xAcc: 0, yAcc: -10, facing: 1
    };
  }, [tiles, tilesWidth]);

  // called on player win
  function playerWin() {
    setPlaying(false);
  }

  // listen for keys
  useEffect(() => {
    // key listeners
    const onKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true;
      // handle map switches
      if (!playing) {
        if (['KeyW', 'ArrowUp'].includes(e.code)) {
          if (mapY < mapHeight - 1) setMapY(mapY + 1);
        }
        if (['KeyA', 'ArrowLeft'].includes(e.code)) {
          if (mapX > 0) setMapX(mapX - 1);
        }
        if (['KeyS', 'ArrowDown'].includes(e.code)) {
          if (mapY > 0) setMapY(mapY - 1);
        }
        if (['KeyD', 'ArrowRight'].includes(e.code)) {
          if (mapX < mapWidth - 1) setMapX(mapX + 1);
        }
      }
    }
    const onKeyUp = (e: KeyboardEvent) => delete keys[e.code];
    // add key listeners
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    // clear key listeners
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    }
  }, [mapHeight, mapWidth, mapX, mapY, playing]);

  // draws screen
  const draw = useCallback(() => {
    // return if loading images
    if (!images) return;
    // clear screen
    ctx.clearRect(0, 0, screenPixels, screenPixels);
    // playing draw
    if (playing) {
      // calculate screen offsets
      const maxWidth = mapWidth * screenPixels;
      const playerCenterX = player.x + tilePixels / 2;
      const halfScreen = screenPixels / 2;
      const screenX = playerCenterX - halfScreen;
      const xOffset = playerCenterX < halfScreen ? 0
        : Math.min(maxWidth - screenPixels, screenX);
      const maxHeight = mapHeight * screenPixels;
      const playerCenterY = player.y + tilePixels / 2;
      const screenY = playerCenterY - halfScreen;
      const yOffset = playerCenterY < halfScreen ? 0
        : Math.min(maxHeight - screenPixels, screenY);
      // for each tile
      for (let x = 0; x < tilesWidth; x++) {
        for (let y = 0; y < tilesHeight; y++) {
          // calculate tile position
          const tileIndex = y * tilesWidth + x;
          const tile = tiles[tileIndex];
          const tileX = x * tilePixels - xOffset;
          const tileY = y * tilePixels - yOffset;
          // draw tile
          if (tile !== -1) {
            ctx.drawImage(
              images.tiles,
              tile * 8, 0, 8, 8,
              tileX, tileY, tilePixels, tilePixels
            );
          }
        }
      }
      // draw player
      ctx.drawImage(
        images.player,
        grounded ? 0 : 8, player.facing === 1 ? 0 : 8, 8, 8,
        player.x - xOffset, player.y - yOffset, tilePixels, tilePixels
      );
    } else { // editing draw
      // for each tile
      for (let x = 0; x < screenTiles; x++) {
        for (let y = 0; y < screenTiles; y++) {
          // calculate tile position
          const tileX = mapX * screenTiles + x;
          const tileY = (mapHeight - 1 - mapY) * screenTiles + y;
          const tileIndex = tileY * tilesWidth + tileX;
          const tile = tiles[tileIndex];
          // draw tile
          if (tile !== -1) {
            ctx.drawImage(
              images.tiles,
              tile * 8, 0, 8, 8,
              x * tilePixels, y * tilePixels, tilePixels, tilePixels
            );
          }
          // draw hover
          if (tileIndex === hoverIndex) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(
              x * tilePixels, y * tilePixels, tilePixels, tilePixels
            );
          }
        }
      }
    }
  }, [
    mapHeight, mapWidth, mapX, mapY, images,
    playing, tiles, tilesHeight, tilesWidth, hoverIndex
  ]);

  // draw on data update
  useEffect(() => {
    draw();
  }, [draw]);

  // moves player based on given ms delta
  const move = useCallback((deltaTime: number) => {
    // returns whether tile collision happened
    function tileCollision(tileIndexA: number, tileIndexB: number) {
      const tileA = tiles[tileIndexA];
      const tileB = tiles[tileIndexB];
      // handle player win
      if (tileA === endFlagIndex || tileB === endFlagIndex) playerWin();
      const nonColTiles = [-1, startFlagIndex, endFlagIndex];
      return !nonColTiles.includes(tileA) || !nonColTiles.includes(tileB);
    }
    // returns whether tile death happened
    function tileDeath(tileIndexA: number, tileIndexB: number) {
      const tileA = tiles[tileIndexA];
      const tileB = tiles[tileIndexB];
      const deathTiles = [skullIndex];
      return deathTiles.includes(tileA) || deathTiles.includes(tileB);
    }
    // update velocity
    player.yVel += (deltaTime / 900) * player.yAcc;
    player.yVel = Math.max(-10, Math.min(player.yVel, 10));
    player.xVel += (deltaTime / 900) * player.xAcc;
    player.xVel = Math.max(-5, Math.min(player.xVel, 5));
    // update position
    grounded = player.y >= mapHeight * screenPixels - tilePixels;
    player.x += (deltaTime / 25) * player.xVel;
    player.y += (deltaTime / 25) * -player.yVel;
    // handle y movement
    if (player.y <= 0) {
      player.y = 0;
      player.yVel = 0;
    } else if (player.y >= mapHeight * screenPixels - tilePixels) {
      player.y = mapHeight * screenPixels - tilePixels;
      player.yVel = 0;
    } else {
      // check bottom collision
      const playerXLeft = Math.floor((player.x + 1) / tilePixels);
      const playerXRight = Math.floor((player.x + tilePixels - 1) / tilePixels);
      const playerYTop = Math.floor(player.y / tilePixels);
      const playerYBottom = playerYTop + 1;
      // collide with tile at position
      const leftBottomTile = playerYBottom * tilesWidth + playerXLeft;
      const rightBottomTile = playerYBottom * tilesWidth + playerXRight;
      // get tiles
      if (tileCollision(leftBottomTile, rightBottomTile)) {
        // if player moving down
        if (player.yVel < 0) {
          player.y = playerYTop * tilePixels;
          player.yVel = 0;
          grounded = true;
        }
        // check death
        if (tileDeath(rightBottomTile, leftBottomTile)) {
          resetPlayer();
          return;
        }
      } else {
        // check top collision
        const leftTopTile = playerYTop * tilesWidth + playerXLeft;
        const rightTopTile = playerYTop * tilesWidth + playerXRight;
        // collide with tile at position
        if (tileCollision(leftTopTile, rightTopTile)) {
          // if player moving up
          if (player.yVel > 0) {
            player.y = (playerYTop + 1) * tilePixels;
            player.yVel = 0;
          }
          // check death
          if (tileDeath(leftTopTile, rightTopTile)) {
            resetPlayer();
            return;
          }
        }
      }
    }
    // handle x movement
    if (player.x <= 0) {
      player.x = 0;
      player.xVel = 0;
    } else if (player.x >= mapWidth * screenPixels - tilePixels) {
      player.x = mapWidth * screenPixels - tilePixels;
      player.xVel = 0;
    } else {
      // check right collision
      const playerXLeft = Math.floor(player.x / tilePixels);
      const playerXRight = playerXLeft + 1;
      const playerYTop = Math.floor((player.y + 1) / tilePixels);
      const playerYBottom = Math.floor((player.y + tilePixels - 1) / tilePixels);
      // collide with tile at position
      const rightTopTile = playerYTop * tilesWidth + playerXRight;
      const rightBottomTile = playerYBottom * tilesWidth + playerXRight;
      if (tileCollision(rightTopTile, rightBottomTile)) {
        // if player moving right
        if (player.xVel > 0) {
          player.x = playerXLeft * tilePixels;
          player.xVel = 0;
        }
        // check death
        if (tileDeath(rightTopTile, rightBottomTile)) {
          resetPlayer();
          return;
        }
      } else {
        // check left collision
        const leftTopTile = playerYTop * tilesWidth + playerXLeft;
        const leftBottomTile = playerYBottom * tilesWidth + playerXLeft;
        // collide with tile at position
        if (tileCollision(leftTopTile, leftBottomTile)) {
          // if player moving left
          if (player.xVel < 0) {
            player.x = (playerXLeft + 1) * tilePixels;
            player.xVel = 0;
          }
          // check death
          if (tileDeath(leftTopTile, leftBottomTile)) {
            resetPlayer();
            return;
          }
        }
      }
    }
    // detect keys
    const upKey = keys['Space'] || keys['ArrowUp'] || keys['KeyW'];
    const leftKey = keys['ArrowLeft'] || keys['KeyA'];
    const rightKey = keys['ArrowRight'] || keys['KeyD'];
    // handle keys
    if (upKey && grounded) player.yVel = 8.7;
    if (rightKey && leftKey) player.xAcc = 0;
    else if (rightKey) {
      player.xAcc = 5;
      player.facing = 1;
    }
    else if (leftKey) {
      player.xAcc = -5;
      player.facing = -1;
    }
    else player.xAcc = 0;
    // apply friction
    const movingAgainst = grounded && ((player.xAcc > 0 && player.xVel < 0)
      || (player.xAcc < 0 && player.xVel > 0));
    if (player.xAcc === 0 || movingAgainst) {
      const damping = grounded ? 0.75 : 0.1;
      player.xVel = player.xVel / (1 + damping * (deltaTime / 100));
      if (Math.abs(player.xVel) < 0.05) player.xVel = 0;
    }
  }, [mapWidth, mapHeight, tilesWidth, tiles, resetPlayer]);

  // set up game loop
  useEffect(() => {
    // set times
    let lastTime: number;
    let deltaTime: number;
    // define game loop
    function gameLoop(time: number) {
      // update time
      if (lastTime !== undefined) deltaTime = time - lastTime;
      lastTime = time;
      // run loop
      draw();
      if (deltaTime !== undefined) move(deltaTime);
      loop = requestAnimationFrame(gameLoop);
    }
    // run game loop
    let loop: number;
    if (playing) {
      resetPlayer();
      loop = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(loop);
  }, [draw, playing, move, resetPlayer]);

  // sketches screen with given mouse data
  function sketch(e: MouseEvent) {
    // return if playing
    if (playing) return;
    // get tile index
    const tileIndex = getTileIndex(e);
    // update tiles
    const newTiles = tiles.slice();
    // replace existing flags
    if ([startFlagIndex, endFlagIndex].includes(selectedIndex)) {
      const flagIndex = newTiles.indexOf(selectedIndex)
      newTiles[flagIndex] = -1;
    }
    newTiles[tileIndex] = selectedIndex === eraserIndex ? -1 : selectedIndex;
    setTiles(newTiles);
  }

  // called on mouse down
  function onMouseDown(e: MouseEvent) {
    sketching = true;
    sketch(e);
  }

  // called on mouse move
  function onMouseMove(e: MouseEvent) {
    // return if playing
    if (playing) return;
    // sketch at mouse position
    if (sketching) sketch(e);
    // set hover index
    const tileIndex = getTileIndex(e);
    setHoverIndex(tileIndex);
  }

  // called on mouse up
  function onMouseUp() {
    sketching = false;
  }

  // called on mouse leave
  function onMouseLeave() {
    sketching = false;
    setHoverIndex(-1);
  }

  // resize map on dimension change
  useEffect(() => {
    // return if no changes
    if (oldMapWidth == mapWidth && oldMapHeight == mapHeight) return;
    // height increased
    if (mapHeight > oldMapHeight) {
      const mapsToAdd = (mapHeight - oldMapHeight) * mapWidth;
      const newTiles = Array(mapsToAdd * mapTiles).fill(-1);
      setTiles(newTiles.concat(tiles));
    }
    // height decreased
    if (mapHeight < oldMapHeight) {
      const mapsToRemove = (oldMapHeight - mapHeight) * mapWidth;
      const lastTileIndex = mapsToRemove * mapTiles;
      setTiles(tiles.slice(lastTileIndex));
    }
    // width increased
    if (mapWidth > oldMapWidth) {
      const tilesToAdd = (mapWidth - oldMapWidth) * screenTiles;
      const newTiles = tiles.slice();
      const oldTilesWidth = oldMapWidth * screenTiles;
      const startIndex = oldTilesWidth * tilesHeight;
      for (let i = startIndex; i > 0; i -= oldTilesWidth) {
        newTiles.splice(i, 0, ...Array(tilesToAdd).fill(-1));
      }
      setTiles(newTiles);
    }
    // width decreased
    if (mapWidth < oldMapWidth) {
      const tilesToRemove = (oldMapWidth - mapWidth) * screenTiles;
      const newTiles = tiles.slice();
      const oldTilesWidth = oldMapWidth * screenTiles;
      const startIndex = oldTilesWidth * tilesHeight - tilesToRemove;
      for (let i = startIndex; i > 0; i -= oldTilesWidth) {
        newTiles.splice(i, tilesToRemove);
      }
      setTiles(newTiles);
    }
    // update old dimensions
    oldMapWidth = mapWidth;
    oldMapHeight = mapHeight;
  }, [mapHeight, mapWidth, tiles, tilesHeight]);

  return (
    <div className={styles.container}>
      <Toolbar
        playing={playing}
        setPlaying={setPlaying}
        mapWidth={mapWidth}
        setMapWidth={setMapWidth}
        mapHeight={mapHeight}
        setMapHeight={setMapHeight}
        mapX={mapX}
        setMapX={setMapX}
        mapY={mapY}
        setMapY={setMapY}
      />
      <div className={styles.view} ref={containerRef}>
        {
          !playing &&
          <>
            {
              mapY < mapHeight - 1 &&
              <IconButton
                icon="arrow-up"
                onClick={() => setMapY(mapY + 1)}
                className={styles.up}
              />
            }
            {
              mapX > 0 &&
              <IconButton
                icon="arrow-left"
                onClick={() => setMapX(mapX - 1)}
                className={styles.left}
              />
            }
            {
              mapY > 0 &&
              <IconButton
                icon="arrow-down"
                onClick={() => setMapY(mapY - 1)}
                className={styles.down}
              />
            }
            {
              mapX < mapWidth - 1 &&
              <IconButton
                icon="arrow-right"
                onClick={() => setMapX(mapX + 1)}
                className={styles.right}
              />
            }
            <div className={styles.tile}>
              {tileNames[
                tileHoverIndex === -1 ? selectedIndex : tileHoverIndex
              ]}
            </div>
            <div className={styles.coords}>
              <span>({mapX + 1}, {mapY + 1})</span>
            </div>
          </>
        }
        <canvas
          className={
            playing ? undefined :
              selectedIndex === -1 ? styles.eraser : styles.paintbrush
          }
          ref={canvasRef}
          width={screenPixels}
          height={screenPixels}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
        />
      </div>
      <Tilebar
        playing={playing}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
        tileHoverIndex={tileHoverIndex}
        setTileHoverIndex={setTileHoverIndex}
      />
    </div>
  );
}
