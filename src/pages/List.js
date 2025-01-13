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
          // Remove a indicação localmente após a exclusão
          setIndications((prevIndications) => prevIndications.filter((indication) => indication._id !== id));
        } else {
          console.error('Erro ao excluir a indicação');
        }
      } catch (error) {
        console.error('Erro ao conectar com a API para exclusão:', error);
      }
    }
  };

  useEffect(() => {
    loadIndications();
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Lista de Indicações</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
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
              <td>{indication.isLate ? 'Sim' : 'Não'}</td>
              <td>
                <a href={indication.youtubeLink} target="_blank" rel="noopener noreferrer">
                  Ver Vídeo
                </a>
              </td>
              <td>
                {/* Formatação da data no padrão brasileiro */}
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
                <button className={styles.deleteButton} onClick={() => handleDelete(indication._id)}>
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
