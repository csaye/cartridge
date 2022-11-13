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
            <Image
              src="/img/icons/stop.svg"
              width="24"
              height="24"
              alt="stop.svg"
            />
          </button> :
          <button onClick={() => setPlaying(true)}>
            <Image
              src="/img/icons/play.svg"
              width="24"
              height="24"
              alt="play.svg"
            />
          </button>
      }
    </div>
  );
}
