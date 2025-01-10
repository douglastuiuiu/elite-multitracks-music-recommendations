import { useState } from 'react';
import SearchMusic from '../components/SearchMusic';

export default function Home() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(''); // Novo estado para armazenar a mensagem de alerta

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setResults([]);
      return [];
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/searchMusic?query=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        return data.results || []; // Retorna os resultados para a validação
      } else {
        console.error('Erro na API:', await response.text());
        setResults([]);
        return [];
      }
    } catch (error) {
      console.error('Erro ao buscar músicas:', error);
      setResults([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleAlert = (message) => {
    setAlertMessage(message); // Atualiza a mensagem de alerta
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f8f8', minHeight: '100vh', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333' }}>
          Multitracks Elite - Indicações Março/2025
        </h1>
      </header>
      <SearchMusic onSearch={handleSearch} onAlert={handleAlert} results={results} />
      {alertMessage && (
        <p style={{ color: 'red', fontSize: '18px', textAlign: 'center', marginTop: '20px' }}>
          {alertMessage}
        </p>
      )}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        {loading ? (
          <p style={{ color: '#888', fontSize: '18px' }}>Carregando...</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
            {results.length === 0 ? (
              <p style={{ color: '#888', fontSize: '18px' }}>Nenhum resultado encontrado :(</p>
            ) : (
              results.map((music, index) => {
                // Verificar se o vídeo é do canal Elite
                const isElite = music.isElite;
                
                return (
                  <div
                    key={index}
                    style={{
                      width: '300px',
                      padding: '15px',
                      borderRadius: '15px',
                      backgroundColor: isElite ? '#f8d7da' : '#ffffff', // Destacar as músicas do canal Elite
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                      textAlign: 'center',
                      border: isElite ? '1px solid #f5c6cb' : '1px solid #ccc',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <a
                      href={music.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        width: '100%',
                        height: '0',
                        paddingBottom: '56.25%', // Proporção 16:9
                        backgroundImage: `url(https://img.youtube.com/vi/${music.url.split('v=')[1]}/0.jpg)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: '10px',
                        marginBottom: '10px',
                        textDecoration: 'none',
                      }}
                    />
                    <h3
                      style={{
                        fontSize: '18px',
                        color: '#333',
                        marginBottom: '10px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2, // Limita a 2 linhas
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {music.title}
                    </h3>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
                      <a
                        href="/indicate"
                        style={{
                          textDecoration: 'none',
                          color: '#0070f3',
                          fontWeight: 'bold',
                        }}
                      >
                        Indicar Música
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
