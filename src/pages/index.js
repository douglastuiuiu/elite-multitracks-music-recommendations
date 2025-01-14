import { useState } from 'react';
import SearchMusic from '../components/SearchMusic';
import Link from 'next/link';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

export default function Home() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [query, setQuery] = useState(''); // Estado para controlar a pesquisa

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setResults([]);
      setQuery(''); // Reseta o estado de query para indicar que não há pesquisa
      return [];
    }

    setQuery(query); // Atualiza o estado de query quando há uma pesquisa
    setLoading(true);
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
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

  // Função para tratar a limpeza do campo de pesquisa
  const handleClearSearch = () => {
    setResults([]); // Limpa os resultados
    setQuery(''); // Limpa o estado da pesquisa
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#181a29', minHeight: '100vh', padding: '20px', color: '#ffffff' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flow', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src="/elite-1x.png"
              alt="Logo"
              style={{ width: '60px', height: '60px', marginRight: '10px' }} // Ajuste o tamanho conforme necessário
            />
            <h1 style={{ paddingTop: '17px', fontSize: '33px', fontWeight: 'bold', lineHeight: '40px' }}>
              Multitracks Elite
            </h1>
          </div>
          <h1 style={{ paddingTop: '17px', fontSize: '28px', fontWeight: 'bold', color: '#4CAF50', lineHeight: '40px' }}>
            Indicações Março/2025
          </h1>
        </div>

      </header >
      <SearchMusic
        onSearch={handleSearch}
        onAlert={handleAlert}
        results={results}
        onClear={handleClearSearch} // Adicionando a função de limpeza para o componente de pesquisa
      />
      {
        alertMessage && (
          <p style={{ color: '#f44336', fontSize: '18px', textAlign: 'center', marginTop: '20px' }}>
            {alertMessage}
          </p>
        )
      }
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        {loading ? (
          <p style={{ color: '#888', fontSize: '18px' }}>Carregando...</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
            {results.length === 0 && query.trim() && ( // Exibe a mensagem apenas se houver pesquisa e resultados vazios
              <p style={{ color: '#ccc', fontSize: '18px' }}>Nenhum resultado encontrado :(</p>
            )}
            {results.map((music, index) => {
              const isElite = music.isElite;

              return (
                <div
                  key={index}
                  style={{
                    width: '300px',
                    padding: '15px',
                    borderRadius: '15px',
                    backgroundColor: isElite ? 'rgba(240, 90, 100, 0.4)' : 'rgba(35, 36, 62, 0.5)',
                    boxShadow: '0 8px 15px rgba(0, 0, 0, 0.2)',
                    textAlign: 'center',
                    border: isElite ? '1px solid rgba(240, 90, 100, 0.8)' : '1px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
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
                      color: '#ffffff',
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
                    {!isElite && (
                      <Link
                        href={{
                          pathname: '/New',
                          query: { youtubeLink: music.url },
                        }}
                        passHref
                      >
                        <div
                          style={{
                            textDecoration: 'none',
                            color: '#1e90ff',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                          }}
                        >
                          Indicar Música
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Analytics />
      <SpeedInsights />
    </div >
  );
}
