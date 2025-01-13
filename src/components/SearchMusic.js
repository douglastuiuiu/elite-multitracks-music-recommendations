import { useState, useEffect } from 'react';
import ClearIcon from '@mui/icons-material/Clear'; // Ícone de limpar

export default function SearchMusic({ onSearch, onAlert }) {
  const [query, setQuery] = useState('');
  const [timer, setTimer] = useState(null);
  const [isExistingInElite, setIsExistingInElite] = useState(false);

  // Função para tratar mudanças no campo de busca
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Limpa o timer anterior para evitar múltiplas chamadas
    if (timer) {
      clearTimeout(timer);
    }

    // Configura um novo timer para disparar a busca após 2 segundos
    const newTimer = setTimeout(async () => {
      if (value.trim()) {
        const { results, existsInElite } = await onSearch(value);
        setIsExistingInElite(existsInElite);
        checkIfExistsInElite(existsInElite);
      }
    }, 400);

    setTimer(newTimer);
  };

  // Função para tratar o pressionamento de teclas
  const handleKeyDown = async (e) => {
    if (e.key === 'Enter' && query.trim()) {
      // Limpa o timer para evitar buscas duplicadas
      if (timer) {
        clearTimeout(timer);
      }

      // Chama a função de busca diretamente
      const { results, existsInElite } = await onSearch(query);
      setIsExistingInElite(existsInElite);
      checkIfExistsInElite(existsInElite);
    }
  };

  // Função para limpar o campo de busca
  const handleClear = () => {
    setQuery('');
    onSearch(''); // Chama a busca para limpar os resultados
    setIsExistingInElite(false); // Reseta o estado de alerta

    // Limpa o timer ativo
    if (timer) {
      clearTimeout(timer);
    }
  };

  // Função que exibe o alerta caso a música já exista no canal Elite
  const checkIfExistsInElite = (exists) => {
    if (exists) {
      onAlert('PODE JÁ EXISTIR UMA PRODUÇÃO DESTA MÚSICA'); // Exibe o alerta
    } else {
      onAlert('');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <div style={{ position: 'relative', width: '80%', margin: '0 auto' }}>
        <input
          type="text"
          placeholder="Pesquise por nome ou URL (não precisa ser completo)"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            padding: '25px',
            fontSize: '20px',
            borderRadius: '50px',
            border: isExistingInElite ? '2px solid red' : '1px solid #ddd',
            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
            outline: 'none',
            backgroundColor: '#f8f8f8',
            paddingRight: '50px',
          }}
        />
        {query && (
          <button
            onClick={handleClear}
            style={{
              padding: '15px 0 10px',
              width: '50px',
              background: 'none',
              outline: 'none',
              borderRadius: '50%',
              border: 'none',
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
            }}
          >
            <ClearIcon style={{ fontSize: '20px', color: '#333' }} />
          </button>
        )}
      </div>
      {isExistingInElite && (
        <p style={{ color: 'red', fontSize: '16px', marginTop: '10px' }}>
          PODE JÁ EXISTIR UMA PRODUÇÃO DESTA MÚSICA
        </p>
      )}
    </div>
  );
}
