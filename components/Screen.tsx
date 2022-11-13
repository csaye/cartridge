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
    canvas = canvasRef.current;
    ctx = canvas?.getContext('2d');
  }, []);

  // called on mouse down
  function onMouseDown() {
  }

  // called on mouse move
  function onMouseMove() {
  }

  // called on mouse up
  function onMouseUp() {
  }

  // called on mouse leave
  function onMouseLeave() {
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
