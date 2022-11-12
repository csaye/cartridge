import Screen from '../components/Screen';
import styles from '../styles/pages/Index.module.scss';

export default function Index() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Screen />
      </div>
    </div>
  );
}
