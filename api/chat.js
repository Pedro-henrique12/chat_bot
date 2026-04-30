import axios from 'axios';

export default async function handler(req, res) {
  // Aceita apenas requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', req.body, {
      headers: {
        // A Vercel vai injetar a sua chave aqui com segurança
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}