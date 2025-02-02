import { useState } from 'react';
import { useRouter } from 'next/router';
import YouTube from 'react-youtube';
import styles from '../styles/IndicateMusic.module.css'; // Importar estilos dedicados

export default function IndicateMusic() {
  const router = useRouter();
  const { youtubeLink, title } = router.query; // Captura o parâmetro da URL
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Extrair o ID do vídeo do link do YouTube
  const videoId = youtubeLink?.includes('/') ? youtubeLink.split('/')[3].split('&')[0] : '';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !youtubeLink || !title) {
      setMessage('Todos os campos são obrigatórios.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/indicateMusic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, youtubeLink, title }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Indicação realizada com sucesso!');
        setName('');
        setEmail('');
        router.push('/Success'); // Redirecionar após sucesso
      } else {
        setMessage(data.error || 'Erro ao realizar a indicação.');
      }
    } catch (error) {
      setMessage('Erro ao enviar a indicação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src="/elite-1x.png"
            alt="Logo"
            style={{ width: '40px', height: '40px', marginRight: '10px' }} // Ajuste o tamanho conforme necessário
          />
          <h1 style={{ paddingTop: '17px', fontSize: '28px', fontWeight: 'bold', lineHeight: '40px' }}>
            Indicar essa Música
          </h1>
        </div>
      </header>
      <div className={styles.formWrapper}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Nome Completo:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">E-mail:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.videoWrapper}>
            <label>Vídeo Selecionado:</label>
            <YouTube videoId={videoId} opts={{ height: '315', width: '100%' }} />
          </div>
          {message && (
            <p className={message.includes('sucesso') ? styles.successMessage : styles.errorMessage}>
              {message}
            </p>
          )}
          <div className={styles.buttonWrapper}>
            <button type="button" onClick={() => router.push('/')} className={styles.backButton}>
              Voltar
            </button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Enviando...' : 'Indicar Música'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
