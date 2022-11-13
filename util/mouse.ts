import { MouseEvent } from 'react';

// returns mouse position adjusted to container
export function getMousePosition(
  e: MouseEvent,
  canvas: HTMLCanvasElement,
  container?: HTMLDivElement
) {
  // get mouse position
  const borderSize = parseInt(getComputedStyle(canvas).border);
  let mouseX = e.clientX - canvas.offsetLeft + window.scrollX - borderSize;
  let mouseY = e.clientY - canvas.offsetTop + window.scrollY - borderSize;
  // adjust by container scroll
  if (container) {
    mouseX += container.scrollLeft - container.offsetLeft;
    mouseY += container.scrollTop - container.offsetTop;
  }
  // clamp mouse position
  if (mouseX < 0) mouseX = 0;
  else if (mouseX > canvas.width - 1) mouseX = canvas.width - 1;
  if (mouseY < 0) mouseY = 0;
  else if (mouseY > canvas.height - 1) mouseY = canvas.height - 1;
  // return mouse position
  return [mouseX, mouseY];
}

// returns unit index of mouse position
export function getMouseIndex(
  e: MouseEvent,
  canvas: HTMLCanvasElement,
  roundUnit: number,
  unitWidth: number,
  container?: HTMLDivElement
) {
  // get mouse position
  const [mouseX, mouseY] = getMousePosition(e, canvas, container);
  // round position
  const unitX = Math.floor(mouseX / roundUnit);
  const unitY = Math.floor(mouseY / roundUnit);
  // return index
  return unitY * unitWidth + unitX;
}
