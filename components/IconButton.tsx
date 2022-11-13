import Image from 'next/image';
import styles from '../styles/components/IconButton.module.scss';

type Props = {
  onClick: () => void;
  icon: string;
};

export default function IconButton(props: Props) {
  const { onClick, icon } = props;

  return (
    <div className={styles.container}>
    </div>
  );
}
