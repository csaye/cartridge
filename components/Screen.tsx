import { useEffect, useRef } from 'react';
import styles from '../styles/components/Screen.module.scss';

let canvas;
let ctx;

export default function Screen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // get canvas context on start
  useEffect(() => {
    canvas = canvasRef.current;
    ctx = canvas?.getContext('2d');
  }, []);

  return (
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        width="256"
        height="256"
      />
    </div>
  );
}
