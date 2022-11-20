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
const keys: { [key: string]: boolean } = {};
let player = { x: 0, y: 0, xVel: 0, yVel: 0, xAcc: 0, yAcc: -10 };

let defaultTiles = Array(screenTiles ** 2).fill(-1);
defaultTiles[screenTiles ** 2 - 1] = 0;
defaultTiles[screenTiles ** 2 - screenTiles - 1] = 0;
defaultTiles[screenTiles ** 2 - screenTiles] = 0;
defaultTiles[screenTiles ** 2 - screenTiles * 2] = 0;

export default function Screen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [hoverIndex, setHoverIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tiles, setTiles] = useState(defaultTiles);
  const [playing, setPlaying] = useState(false);

  // initialize images
  useEffect(() => {
    tilesImage = new Image();
    tilesImage.src = '/img/sprites/tiles.png';
    tilesImage.onload = () => setLoaded(true);
  }, []);

  // get canvas context on start
  useEffect(() => {
    [canvas, ctx] = getCanvasContext(canvasRef);
    ctx.imageSmoothingEnabled = false;
  }, []);

  // listen for keys
  useEffect(() => {
    // key listeners
    const onKeyDown = (e: KeyboardEvent) => keys[e.code] = true;
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
    // get mouse index
    const mouseIndex = getMouseIndex(e, canvas, tilePixels, screenTiles);
    // update tiles
    const newTiles = tiles.slice();
    newTiles[mouseIndex] = selectedIndex;
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
    const mouseIndex = getMouseIndex(e, canvas, tilePixels, screenTiles);
    setHoverIndex(mouseIndex);
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

  return (
    <div className={styles.container}>
      <Toolbar
        playing={playing}
        setPlaying={setPlaying}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
      />
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
      <Tilebar
        playing={playing}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
      />
    </div>
  );
}
