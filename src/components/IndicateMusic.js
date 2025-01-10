import { useState } from 'react';

function IndicateMusic() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('/api/indications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, youtubeLink }),
    });

    const data = await response.json();

    if (data.message) {
      setMessage(data.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nome da Música"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="url"
          placeholder="Link do YouTube"
          value={youtubeLink}
          onChange={(e) => setYoutubeLink(e.target.value)}
        />
        <button type="submit">Enviar Indicação</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default IndicateMusic;
