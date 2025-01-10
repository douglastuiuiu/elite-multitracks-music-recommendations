import { useState } from 'react';
import ClearIcon from '@mui/icons-material/Clear'; // Ícone de limpar

export default function SearchMusic({ onSearch, onAlert }) {
  const [query, setQuery] = useState('');
  const [isExistingInElite, setIsExistingInElite] = useState(false); // Estado para controle da validação

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter' && query.trim()) {
      // Chama a função de busca passando a query
      const { results, existsInElite } = await onSearch(query);
      setIsExistingInElite(existsInElite); // Atualiza o estado com o valor retornado
      checkIfExistsInElite(existsInElite);
    }
  };

  const handleClear = () => {
    setQuery('');
    onSearch(''); // Chama a busca para limpar os resultados
    setIsExistingInElite(false); // Reseta o estado de alerta
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
            border: isExistingInElite ? '2px solid red' : '1px solid #ddd', // Campo vermelho se já existir no Elite
            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
            outline: 'none',
            backgroundColor: '#f8f8f8',
            paddingRight: '50px', // Espaço para o ícone de limpar
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
              right: '10px', // "X" no canto direito do campo
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