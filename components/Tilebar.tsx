import { Dispatch, MouseEvent, useEffect, useRef, useState } from 'react';
import styles from '../styles/components/Tilebar.module.scss';
import getCanvasContext from '../util/getCanvasContext';
import { getMouseIndex } from '../util/mouse';
import { screenPixels, screenTiles, tilePixels } from '../util/units';

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let tilesImage: HTMLImageElement;
let container: HTMLDivElement;

type Props = {
  playing: boolean;
  selectedIndex: number;
  setSelectedIndex: Dispatch<number>;
  tileHoverIndex: number;
  setTileHoverIndex: Dispatch<number>;
};

export default function Tilebar(props: Props) {
  const {
    playing, selectedIndex, setSelectedIndex,
    tileHoverIndex, setTileHoverIndex
  } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [loaded, setLoaded] = useState(false);

  // get canvas context on start
  useEffect(() => {
    if (!containerRef.current) throw 'no container';
    container = containerRef.current;
    [canvas, ctx] = getCanvasContext(canvasRef);
    ctx.imageSmoothingEnabled = false;
  }, []);

  // initialize images
  useEffect(() => {
    tilesImage = new Image();
    tilesImage.src = '/img/sprites/tiles.png';
    tilesImage.onload = () => setLoaded(true);
  }, []);

  // draw on data update
  useEffect(() => {
    ctx.clearRect(0, 0, screenPixels, screenPixels);
    ctx.drawImage(tilesImage, 0, 0, screenPixels, tilePixels);
    for (let x = 0; x < screenTiles; x++) {
      for (let y = 0; y < screenTiles; y++) {
        if (y * screenTiles + x === tileHoverIndex) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.fillRect(x * tilePixels, y * tilePixels, tilePixels, tilePixels);
        }
      }
    }
  }, [tileHoverIndex, selectedIndex, loaded]);

  // called on mouse down
  function onMouseDown(e: MouseEvent) {
    const mouseIndex = getMouseIndex(e, canvas, tilePixels, screenTiles, container);
    setSelectedIndex(mouseIndex);
  }

  // called on mouse move
  function onMouseMove(e: MouseEvent) {
    const mouseIndex = getMouseIndex(e, canvas, tilePixels, screenTiles, container);
    setTileHoverIndex(mouseIndex);
  }

  // called on mouse leave
  function onMouseLeave() {
    setTileHoverIndex(-1);
  }

  return (
    <div
      className={styles.container}
      ref={containerRef}
    >
      <canvas
        ref={canvasRef}
        width={screenPixels}
        height={tilePixels}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      />
      {
        !playing &&
        <div
          className={styles.selectArrow}
          style={{ left: `${32 * selectedIndex + 8}px` }}
        />
      }
    </div>
  );
}
