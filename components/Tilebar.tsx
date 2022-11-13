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
  selectedIndex: number;
  setSelectedIndex: Dispatch<number>;
};

export default function Tilebar(props: Props) {
  const { selectedIndex, setSelectedIndex } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [hoverIndex, setHoverIndex] = useState(-1);
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
        selectedIndex !== -1 &&
        <div
          className={styles.selectArrow}
          style={{ left: `${32 * selectedIndex + 8}px` }}
        />
      }
    </div>
  );
}
