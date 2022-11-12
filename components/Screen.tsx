import styles from '../styles/components/Screen.module.scss';

export default function Screen() {
  return (
    <div className={styles.container}>
      <canvas
        width="256"
        height="256"
      />
    </div>
  );
}
