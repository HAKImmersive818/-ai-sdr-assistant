import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { AISDRAssistant } from '../index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const assistant = new AISDRAssistant();
let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    await assistant.initialize();
    initialized = true;
  }
}

app.get('/api/stats', async (req, res) => {
  try {
    await ensureInitialized();
    const stats = await assistant.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/conversations', async (req, res) => {
  try {
    await ensureInitialized();
    const conversations = await assistant.getActiveConversations();
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/meetings', async (req, res) => {
  try {
    await ensureInitialized();
    const meetings = await assistant.getMeetingsBooked();
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/campaign/start', async (req, res) => {
  try {
    await ensureInitialized();
    const { jobTitles, industries, limit } = req.body;
    
    const results = await assistant.runAutomatedCampaign({
      jobTitles,
      industries,
      limit: limit || 5
    });

    res.json({
      success: true,
      prospectsContacted: results.length,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/prospect/reply', async (req, res) => {
  try {
    await ensureInitialized();
    const { prospectId, message } = req.body;
    
    if (!prospectId || !message) {
      return res.status(400).json({ error: 'prospectId and message are required' });
    }

    const response = await assistant.handleProspectReply(prospectId, message);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/prospect/enrich', async (req, res) => {
  try {
    await ensureInitialized();
    const prospectData = req.body;
    
    const enriched = await assistant.enrichment.enrichProspect(prospectData);
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/message/generate', async (req, res) => {
  try {
    await ensureInitialized();
    const prospectData = req.body;
    
    const message = await assistant.aiEngine.generateOutreachMessage(prospectData);
    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ace-attorney.html'));
});

app.get('/classic', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 AI SDR Assistant Web Interface running on http://localhost:${PORT}`);
  console.log(`\n📊 Dashboard: http://localhost:${PORT}`);
  console.log(`📡 API Endpoints:`);
  console.log(`   GET  /api/stats - Get campaign statistics`);
  console.log(`   GET  /api/conversations - Get active conversations`);
  console.log(`   GET  /api/meetings - Get booked meetings`);
  console.log(`   POST /api/campaign/start - Start automated campaign`);
  console.log(`   POST /api/prospect/reply - Handle prospect reply`);
  console.log(`   POST /api/message/generate - Generate outreach message`);
  console.log(`\n✨ Ready to automate your LinkedIn outreach!\n`);
});
