import { saveIndication } from '../../utils/db'; // Função para salvar indicação no banco

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, youtubeLink, createdAt } = req.body;

    // Verificar se todos os campos necessários estão presentes
    if (!name || !email || !youtubeLink) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
      // Calcular a diferença de tempo entre agora e a data de criação
      const createdAtDate = new Date(createdAt);
      const now = new Date();
      const timeDifference = (now - createdAtDate) / 1000 / 60; // Convertendo para minutos

      // Definir o valor de isLate com base no tempo
      const isLate = timeDifference > 7;

      // Criar a indicação com o novo atributo isLate
      const indication = {
        name,
        email,
        youtubeLink,
        createdAt: createdAtDate,
        isLate,
      };

      // Tenta salvar a indicação no banco
      await saveIndication(indication);

      return res.status(200).json({ success: 'Indicação salva com sucesso!' });
    } catch (error) {
      // Caso já exista um e-mail registrado, retornamos a mensagem de erro
      return res.status(400).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido.' });
  }
}
