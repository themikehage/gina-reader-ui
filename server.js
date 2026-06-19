const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const READER_API = process.env.READER_API || 'https://gina-reader.pages.therry.dev';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/read', async (req, res) => {
  const { url, format = 'markdown' } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const accept = format === 'json' ? 'application/json' : 'text/markdown';
    const response = await fetch(`${READER_API}/${url}`, {
      headers: { 'Accept': accept },
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text || 'Reader API error' });
    }

    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await response.json();
      return res.json(data);
    } else {
      const text = await response.text();
      return res.json({ markdown: text });
    }
  } catch (err) {
    console.error('Reader API error:', err.message);
    return res.status(502).json({ error: 'Failed to reach Reader API' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`gina-reader-ui listening on 0.0.0.0:${PORT}`);
});
