import { Dispatch } from 'react';
import styles from '../styles/components/Toolbar.module.scss';
import IconButton from './IconButton';

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
          <IconButton
            onClick={() => setPlaying(false)}
            icon="stop"
          /> :
          <IconButton
            onClick={() => setPlaying(true)}
            icon="play"
          />
      }
      <IconButton
        onClick={() => setSelectedIndex(-1)}
        icon="eraser"
      />
      {
        (!playing && selectedIndex === -1) &&
        <div className={styles.selectArrow} />
      }
    </div>
  );
}
