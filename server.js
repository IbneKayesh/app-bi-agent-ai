const express = require('express');
const bodyParser = require('body-parser');
const AIAgent = require('./ai-agent');
const db = require('./db');

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3002;
const HOST = process.env.HOST || '0.0.0.0';

app.use(bodyParser.json());
app.use(express.static('public'));

const agent = new AIAgent();

async function start() {
  try {
    // initialize agent (train or load model)
    await agent.init();

    app.post('/chat', async (req, res) => {
      try {
        const query = (req.body && req.body.query) ? String(req.body.query).trim() : '';
        if (!query) return res.status(400).json({ error: 'Missing query in request body' });

        const response = await agent.processQuery(query);

        // Return structured response
        return res.json(response);
      } catch (err) {
        console.error('Error processing query:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.listen(port, HOST, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Failed to initialize agent:', err);
    process.exit(1);
  }
}

start();
