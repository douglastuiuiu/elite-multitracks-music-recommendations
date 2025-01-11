import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import YouTube from 'react-youtube';

export default function IndicateMusic() {
  const router = useRouter();
  const { youtubeLink } = router.query; // Captura o parâmetro da URL
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMusicValid, setIsMusicValid] = useState(true); // Verificação de música válida
  const [existingMusicMessage, setExistingMusicMessage] = useState('');

  let videoId = '';
  if (youtubeLink && youtubeLink.includes('v=')) {
    videoId = youtubeLink.split('v=')[1].split('&')[0]; // Extrai o ID do vídeo
  }

  useEffect(() => {
    const checkMusicValidity = async () => {
      if (!youtubeLink) return;

      try {
        const response = await fetch(`/api/checkMusic?youtubeLink=${encodeURIComponent(youtubeLink)}`);
        if (response.ok) {
          const data = await response.json();
          setIsMusicValid(data.isValid);
          setExistingMusicMessage(data.message || '');
        } else {
          console.error('Erro ao verificar a música');
          setIsMusicValid(false);
        }
      } catch (error) {
        console.error('Erro na verificação da música', error);
        setIsMusicValid(false);
      }
    };

    //checkMusicValidity();
  }, [youtubeLink]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !youtubeLink) {
      setMessage('Todos os campos são obrigatórios.');
      return;
    }

    if (!isMusicValid) {
      setMessage(existingMusicMessage || 'Esta música já foi indicada ou está bloqueada.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/indicateMusic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, youtubeLink }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Indicação realizada com sucesso!');
        setName('');
        setEmail('');
        router.push('/Success'); // Opcional: redirecionar após sucesso
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
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f8f8', minHeight: '100vh', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333' }}>Indique uma Música</h1>
      </header>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="name" style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Nome Completo:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="email" style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>E-mail:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ marginBottom: '15px', textAlign: 'center' }}>
            <label htmlFor="video" style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Vídeo Selecionado:</label>
            <YouTube videoId={videoId} opts={{ height: '315', width: '100%' }} />
          </div>
          {message && <p style={{ color: message.includes('sucesso') ? 'green' : 'red', fontSize: '16px', textAlign: 'center' }}>{message}</p>}
          {existingMusicMessage && <p style={{ color: 'red', fontSize: '16px', textAlign: 'center' }}>{existingMusicMessage}</p>}
          <div style={{ textAlign: 'center' }}>
            <button
              type="submit"
              //disabled={loading || !isMusicValid}
              style={{
                backgroundColor: loading || !isMusicValid ? '#ccc' : '#0070f3',
                color: '#fff',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                fontWeight: 'bold',
                cursor: loading || !isMusicValid ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Enviando...' : 'Indicar Música'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
