import Link from 'next/link';
import styles from '../styles/Success.module.css';

const Success = () => {
  return (
    <div className={styles.container}>
      <div className={styles.message}>
        <h1 className={styles.title}>Obrigado pela sua indicação! 🎶</h1>
        <p className={styles.text}>
          Sua indicação foi registrada com sucesso. Nós agradecemos por contribuir para
          tornar nossa seleção musical ainda mais especial!
        </p>
      </div>
      <div className={styles.actions}>
        <Link href="/">
          <button className={styles.button}>Voltar para a página inicial</button>
        </Link>
      </div>
    </div>
  );
};

export default Success;
