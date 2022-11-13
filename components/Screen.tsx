import { MouseEvent, useEffect, useRef, useState } from 'react';
import styles from '../styles/components/Screen.module.scss';
import getCanvasContext from '../util/getCanvasContext';
import { getMouseIndex } from '../util/mouse';
import { screenPixels, screenTiles, tilePixels } from '../util/units';
import Tilebar from './Tilebar';
import Toolbar from './Toolbar';

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let sketching = false;
let tilesImage: HTMLImageElement;
const keys: { [key: string]: boolean } = {};

export default function Screen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [hoverIndex, setHoverIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tiles, setTiles] = useState(Array(screenTiles ** 2).fill(-1));
  const [loaded, setLoaded] = useState(false);
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

  // sketches screen with given mouse data
  function sketch(e: MouseEvent) {
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
    if (sketching) sketch(e);
    const mouseIndex = getMouseIndex(e, canvas, tilePixels, screenTiles);
    setHoverIndex(mouseIndex);
  }

  // called on mouse up
  function onMouseUp() {
    sketching = false;
  }

  // called on mouse leave
  function onMouseLeave() {
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
        className={selectedIndex === -1 ? styles.eraser : styles.paintbrush}
        ref={canvasRef}
        width={screenPixels}
        height={screenPixels}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      />
      <Tilebar
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
      />
    </div>
  );
}
