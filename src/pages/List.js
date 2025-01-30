import { useEffect, useState } from 'react';
import styles from '../styles/List.module.css';

const List = () => {
  const [indications, setIndications] = useState([]);

  // Função para carregar as indicações da API
  const loadIndications = async () => {
    try {
      const response = await fetch('/api/indications');
      if (response.ok) {
        const data = await response.json();
        setIndications(data);
      } else {
        console.error('Erro ao carregar as indicações');
      }
    } catch (error) {
      console.error('Erro ao conectar com a API:', error);
    }
  };

  // Função para excluir uma indicação
  const handleDelete = async (id) => {
    const isConfirmed = window.confirm('Tem certeza que deseja excluir esta indicação?');

    if (isConfirmed) {
      try {
        const response = await fetch(`/api/indications/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIndications((prevIndications) => prevIndications.filter((indication) => indication._id !== id));
        } else {
          console.error('Erro ao excluir a indicação');
          alert('Erro ao excluir a indicação');
        }
      } catch (error) {
        console.error('Erro ao conectar com a API para exclusão:', error);
        alert('Erro ao conectar com o servidor');
      }
    }
  };

  useEffect(() => {
    loadIndications();
  }, []);

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '-17px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/elite-1x.png"
            alt="Logo"
            style={{ width: '40px', height: '40px', marginRight: '10px' }}
          />
          <h1 style={{ paddingTop: '17px', fontSize: '28px', fontWeight: 'bold', lineHeight: '40px' }}>
            Lista de Indicações
          </h1>
        </div>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Título do Vídeo</th>
            <th>Excede 7min</th>
            <th>Link do YouTube</th>
            <th>Data de Criação</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {indications.map((indication) => (
            <tr key={indication._id}>
              <td>{indication.name}</td>
              <td>{indication.email}</td>
              <td>{indication.title}</td>
              <td>{indication.isLate ? 'Sim' : 'Não'}</td>
              <td>
                <a 
                  href={indication.youtubeLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.videoLink}
                >
                  Ver Vídeo
                </a>
              </td>
              <td>
                {new Date(indication.createdAt).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </td>
              <td>
                <button 
                  className={styles.deleteButton} 
                  onClick={() => handleDelete(indication._id)}
                  aria-label="Excluir indicação"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default List;