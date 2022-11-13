import { useState } from 'react';
import styles from '../styles/components/Toolbar.module.scss';

export default function Toolbar() {
  const [playing, setPlaying] = useState(false);

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
