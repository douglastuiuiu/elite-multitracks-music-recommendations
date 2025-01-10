import { saveIndication } from '../../utils/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, youtubeLink } = req.body;

    if (!name || !email || !youtubeLink) {
      return res.status(400).json({ message: 'Nome, e-mail e link do YouTube são obrigatórios.' });
    }

    try {
      await saveIndication({ name, email, youtubeLink });
      return res.status(200).json({ message: 'Indicação salva com sucesso!' });
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao salvar a indicação.', error });
    }
  } else {
    res.status(405).json({ message: 'Método não permitido.' });
  }
}
