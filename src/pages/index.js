import { useState } from 'react';
import SearchMusic from '../components/SearchMusic';
import Link from 'next/link'; // Importa o Link para navegação entre páginas

export default function Home() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

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
        return data.results || [];
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
    setAlertMessage(message);
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
                const isElite = music.isElite;

                return (
                  <div
                    key={index}
                    style={{
                      width: '300px',
                      padding: '15px',
                      borderRadius: '15px',
                      backgroundColor: isElite ? '#f8d7da' : '#ffffff',
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
                        paddingBottom: '56.25%',
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
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {music.title}
                    </h3>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
                      {/* Link para a página de indicar música com o link do vídeo passado como parâmetro */}
                      <Link
                        href={{
                          pathname: '/IndicateMusic',
                          query: { youtubeLink: music.url },
                        }}
                        passHref
                      >
                        <div
                          style={{
                            textDecoration: 'none',
                            color: '#0070f3',
                            fontWeight: 'bold',
                            cursor: 'pointer', // Opcional: Para dar um visual de link
                          }}
                        >
                          Indicar Música
                        </div>
                      </Link>

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
