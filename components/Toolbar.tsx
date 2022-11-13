import Image from 'next/image';
import { Dispatch } from 'react';
import styles from '../styles/components/Toolbar.module.scss';

type Props = {
  playing: boolean;
  setPlaying: Dispatch<boolean>;
  selectedIndex: number;
  setSelectedIndex: Dispatch<number>;
};

export default function Toolbar(props: Props) {
  const { playing, setPlaying, selectedIndex, setSelectedIndex } = props;

  return (
    <div className={styles.container}>
      {
        playing ?
          <button onClick={() => setPlaying(false)}>
            Stop
          </button> :
          <button onClick={() => setPlaying(true)}>
            Play
          </button>
      }
    </div>
  );
}
