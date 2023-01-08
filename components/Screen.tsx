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
let tilesImage: HTMLImageElement;
let keys: { [key: string]: boolean } = {};
let player = { x: 0, y: 0, xVel: 0, yVel: 0, xAcc: 0, yAcc: -10 };

const mapTiles = screenTiles * screenTiles;

// set default tilemaps
const defaultTiles = Array(mapTiles).fill(-1);

let oldMapWidth: number;
let oldMapHeight: number;

export default function Screen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [hoverIndex, setHoverIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tiles, setTiles] = useState(defaultTiles);
  const [playing, setPlaying] = useState(false);

  const [mapWidth, setMapWidth] = useState(1);
  const [mapHeight, setMapHeight] = useState(1);
  const [mapX, setMapX] = useState(0);
  const [mapY, setMapY] = useState(0);

  const tilesWidth = mapWidth * screenTiles;
  const tilesHeight = mapHeight * screenTiles;

  // initialize images
  useEffect(() => {
    tilesImage = new Image();
    tilesImage.src = '/img/sprites/tiles.png';
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
  }, []);

  // draws screen
  const draw = useCallback(() => {
    // clear screen
    ctx.clearRect(0, 0, screenPixels, screenPixels);
    // for each tile
    for (let x = 0; x < screenTiles; x++) {
      for (let y = 0; y < screenTiles; y++) {
        // get tile
        const tileIndex = y * screenTiles + x;
        const tile = tiles[tileIndex];
        if (tile !== -1) {
          ctx.drawImage(
            tilesImage,
            tile * 8, 0, 8, 8,
            x * tilePixels, y * tilePixels, tilePixels, tilePixels
          );
        }
        // draw hover
        if (tileIndex === hoverIndex) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.fillRect(x * tilePixels, y * tilePixels, tilePixels, tilePixels);
        }
      }
    }
    // draw player
    ctx.fillStyle = '#990000';
    ctx.fillRect(player.x, player.y, tilePixels, tilePixels);
  }, [hoverIndex, tiles]);

  // draw on data update
  useEffect(() => {
    draw();
  }, [draw]);

  // moves player based on given ms delta
  const move = useCallback((deltaTime: number) => {
    // update velocity
    player.yVel += (deltaTime / 900) * player.yAcc;
    player.yVel = Math.max(-10, Math.min(player.yVel, 10));
    player.xVel += (deltaTime / 900) * player.xAcc;
    player.xVel = Math.max(-5, Math.min(player.xVel, 5));
    // update position
    let grounded = player.y >= screenPixels - tilePixels;
    player.y += (deltaTime / 25) * -player.yVel;
    if (player.y <= 0) {
      player.y = 0;
      player.yVel = 0;
    } else if (player.y >= screenPixels - tilePixels) {
      player.y = screenPixels - tilePixels;
      player.yVel = 0;
    } else {
      // check bottom collision
      const playerXLeft = Math.floor((player.x + 1) / tilePixels);
      const playerXRight = Math.floor((player.x + tilePixels - 1) / tilePixels);
      const playerYTop = Math.floor(player.y / tilePixels);
      const playerYBottom = playerYTop + 1;
      // collide with tile at position
      const leftBottomTile = playerYBottom * screenTiles + playerXLeft;
      const rightBottomTile = playerYBottom * screenTiles + playerXRight;
      // get tiles
      if (tiles[leftBottomTile] !== -1 || tiles[rightBottomTile] !== -1) {
        // if player moving down
        if (player.yVel < 0) {
          player.y = playerYTop * tilePixels;
          player.yVel = 0;
          grounded = true;
        }
      } else {
        // check top collision
        const leftTopTile = playerYTop * screenTiles + playerXLeft;
        const rightTopTile = playerYTop * screenTiles + playerXRight;
        // collide with tile at position
        if (tiles[leftTopTile] !== -1 || tiles[rightTopTile] !== -1) {
          // if player moving up
          if (player.yVel > 0) {
            player.y = (playerYTop + 1) * tilePixels;
            player.yVel = 0;
          }
        }
      }
    }
    player.x += (deltaTime / 25) * player.xVel;
    if (player.x <= 0) {
      player.x = 0;
      player.xVel = 0;
    } else if (player.x >= screenPixels - tilePixels) {
      player.x = screenPixels - tilePixels;
      player.xVel = 0;
    } else {
      // check right collision
      const playerXLeft = Math.floor(player.x / tilePixels);
      const playerXRight = playerXLeft + 1;
      const playerYTop = Math.floor((player.y + 1) / tilePixels);
      const playerYBottom = Math.floor((player.y + tilePixels - 1) / tilePixels);
      // collide with tile at position
      const rightTopTile = playerYTop * screenTiles + playerXRight;
      const rightBottomTile = playerYBottom * screenTiles + playerXRight;
      if (tiles[rightTopTile] !== -1 || tiles[rightBottomTile] !== -1) {
        // if player moving right
        if (player.xVel > 0) {
          player.x = playerXLeft * tilePixels;
          player.xVel = 0;
        }
      } else {
        // check left collision
        const leftTopTile = playerYTop * screenTiles + playerXLeft;
        const leftBottomTile = playerYBottom * screenTiles + playerXLeft;
        // collide with tile at position
        if (tiles[leftTopTile] !== -1 || tiles[leftBottomTile] !== -1) {
          // if player moving left
          if (player.xVel < 0) {
            player.x = (playerXLeft + 1) * tilePixels;
            player.xVel = 0;
          }
        }
      }
    }
    // handle keys
    if (keys['Space'] && grounded) player.yVel = 8.7;
    if (keys['ArrowRight'] && keys['ArrowLeft']) player.xAcc = 0;
    else if (keys['ArrowRight']) player.xAcc = 5;
    else if (keys['ArrowLeft']) player.xAcc = -5;
    else player.xAcc = 0;
    // apply friction
    const movingAgainst = grounded && ((player.xAcc > 0 && player.xVel < 0)
      || (player.xAcc < 0 && player.xVel > 0));
    if (player.xAcc === 0 || movingAgainst) {
      const damping = grounded ? 0.75 : 0.1;
      player.xVel = player.xVel / (1 + damping * (deltaTime / 100));
      if (Math.abs(player.xVel) < 0.05) player.xVel = 0;
    }
  }, [tiles]);

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
      player = { x: 0, y: 0, xVel: 0, yVel: 0, xAcc: 0, yAcc: -10 };
      loop = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(loop);
  }, [draw, playing, move]);

  // sketches screen with given mouse data
  function sketch(e: MouseEvent) {
    // return if playing
    if (playing) return;
    // get tile index
    const tileIndex = getTileIndex(e);
    // update tiles
    const newTilemaps = tilemaps.slice();
    const newTiles = newTilemaps[mapIndex].slice();
    newTiles[mouseIndex] = selectedIndex;
    newTilemaps[mapIndex] = newTiles;
    setTilemaps(newTilemaps);
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
      const mapsToRemove = oldMapWidth - mapWidth;
      const newTilemaps = tilemaps.slice();
      const startingIndex = oldMapWidth * mapHeight - mapsToRemove;
      for (let i = startingIndex; i > 0; i -= oldMapWidth) {
        newTilemaps.splice(i, mapsToRemove);
      }
      setTilemaps(newTilemaps);
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
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
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
      />
    </div>
  );
}
