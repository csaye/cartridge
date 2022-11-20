import { Dispatch, useRef } from 'react';
import styles from '../styles/components/Toolbar.module.scss';
import IconButton from './IconButton';

type Props = {
  playing: boolean;
  setPlaying: Dispatch<boolean>;
  selectedIndex: number;
  setSelectedIndex: Dispatch<number>;
};

const maxVertical = 4;
const maxHorizontal = 16;

export default function Toolbar(props: Props) {
  const { playing, setPlaying, selectedIndex, setSelectedIndex } = props;

  const verticalRef = useRef<HTMLSelectElement>(null);
  const horizontalRef = useRef<HTMLSelectElement>(null);

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
      <IconButton
        onClick={() => setSelectedIndex(-1)}
        icon="eraser"
      />
      <IconButton
        onClick={() => { }}
        icon="save"
      />
      {
        (!playing && selectedIndex === -1) &&
        <div className={styles.selectArrow} />
      }
      <span style={{ flexGrow: 1 }} />
      <select ref={verticalRef}>
        {Array(maxVertical).fill(0).map((v, i) =>
          <option key={i} value={i + 1}>↕ {i + 1}</option>
        )}
      </select>
      <select ref={horizontalRef}>
        {Array(maxHorizontal).fill(0).map((v, i) =>
          <option key={i} value={i + 1}>↔ {i + 1}</option>
        )}
      </select>
    </div>
  );
}
