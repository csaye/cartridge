import { Dispatch } from 'react';
import styles from '../styles/components/Toolbar.module.scss';
import IconButton from './IconButton';

type Props = {
  playing: boolean;
  setPlaying: Dispatch<boolean>;
  mapWidth: number;
  setMapWidth: Dispatch<number>;
  mapHeight: number;
  setMapHeight: Dispatch<number>;
  mapX: number;
  setMapX: Dispatch<number>;
  mapY: number;
  setMapY: Dispatch<number>;
};

const maxVertical = 4;
const maxHorizontal = 16;

export default function Toolbar(props: Props) {
  const {
    playing, setPlaying,
    mapWidth, setMapWidth, mapHeight, setMapHeight,
    mapX, setMapX, mapY, setMapY
  } = props;

  // deselects pressed button
  function blurButton() {
    const elem = document.activeElement;
    if (elem instanceof HTMLElement) elem.blur();
  }

  return (
    <div className={styles.container}>
      {
        playing ?
          <IconButton
            onClick={() => {
              setPlaying(false);
              blurButton();
            }}
            icon="stop"
          /> :
          <IconButton
            onClick={() => {
              setPlaying(true);
              blurButton();
            }}
            icon="play"
          />
      }
      {
      }
    </div>
  );
}
