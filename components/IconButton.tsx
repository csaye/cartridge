import Image from 'next/image';
import styles from '../styles/components/IconButton.module.scss';

type Props = {
  onClick: () => void;
  icon: string;
  className?: string;
};

export default function IconButton(props: Props) {
  const { onClick, icon, className } = props;

  return (
    <button
      className={
        className ? `${styles.container} ${className}` : styles.container
      }
      onClick={onClick}
    >
      <Image
        src={`/img/icons/${icon}.svg`}
        width="24"
        height="24"
        alt={`${icon}.svg`}
      />
    </button>
  );
}
