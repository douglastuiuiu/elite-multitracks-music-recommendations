import { saveIndication } from '../../utils/db'; // Função para salvar indicação no banco

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, youtubeLink } = req.body;

    if (!name || !email || !youtubeLink) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
      // Tenta salvar a indicação no banco
      await saveIndication({ name, email, youtubeLink });
      return res.status(200).json({ success: 'Indicação salva com sucesso!' });
    } catch (error) {
      // Caso já exista um e-mail registrado, retornamos a mensagem de erro
      return res.status(400).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido.' });
  }
}
