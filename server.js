import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({
  origin: ['https://alexcrowd3-prime-team-landing-arena-2754.twc1.net']
}));
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data', 'visits.json');

// Создаем папку data, если её нет
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, '[]');
}

// API для сохранения визитов
app.post('/api/track', (req, res) => {
  try {
    const visits = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    visits.push(req.body);
    fs.writeFileSync(DATA_FILE, JSON.stringify(visits, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавьте этот код в server.js
app.delete('/api/track', (req, res) => {
  try {
    fs.writeFileSync(DATA_FILE, '[]');
    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API для получения визитов (для админки)
app.get('/api/track', (req, res) => {
  try {
    const visits = fs.existsSync(DATA_FILE) 
      ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
      : [];
    res.json(visits);
  } catch (error) {
    console.error('Ошибка чтения:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер запущен на http://0.0.0.0:${PORT}`);
});