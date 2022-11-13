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

  return (
    <div className={styles.container}>
    </div>
  );
}
