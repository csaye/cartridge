import { RefObject } from 'react';

// returns canvas and context for given ref
export default function getCanvasContext(
  canvasRef: RefObject<HTMLCanvasElement>
): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = canvasRef.current;
  if (!canvas) throw 'canvas is null';
  const ctx = canvas.getContext('2d');
  if (!ctx) throw 'context is null';
  return [canvas, ctx];
}
