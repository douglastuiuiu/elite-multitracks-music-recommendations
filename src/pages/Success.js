import Link from 'next/link';
import styles from '../styles/Success.module.css';

const Success = () => {
  return (
    <div className={styles.container}>
      <div className={styles.message}>
        <div style={{ display: 'flow', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src="/elite-1x.png"
            alt="Logo"
            style={{ width: '200px', height: '200px', marginRight: '10px' }} // Ajuste o tamanho conforme necessário
          />
          <h1 className={styles.title}>Obrigado pela sua indicação! 🎶</h1>
        </div>
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
