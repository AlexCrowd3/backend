import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Настройка CORS (убраны лишние пробелы в URL!)
app.use(cors({
  origin: ['https://alexcrowd3-prime-team-landing-arena-2754.twc1.net ']
}));

// Парсим JSON тела запросов
app.use(express.json());

// Путь к файлу данных
const DATA_FILE = path.join(__dirname, 'data', 'visits.json');

// Создаём папку data, если её нет
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// Создаём файл visits.json, если его нет или он пустой
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]');
}

// POST /api/track — сохранение посещения
app.post('/api/track', (req, res) => {
  try {
    let visits = [];

    // Читаем текущие данные
    const data = fs.readFileSync(DATA_FILE, 'utf-8').trim();
    if (data !== '') {
      visits = JSON.parse(data);
    }

    // Добавляем новое посещение
    visits.push(req.body);

    // Сохраняем обратно в файл
    fs.writeFileSync(DATA_FILE, JSON.stringify(visits, null, 2));

    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка при сохранении посещения:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/track — получение всех посещений (для админки)
app.get('/api/track', (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return res.json([]);
    }

    const data = fs.readFileSync(DATA_FILE, 'utf-8').trim();

    // Если файл пустой — возвращаем пустой массив
    if (data === '') {
      return res.json([]);
    }

    const visits = JSON.parse(data);
    res.json(visits);
  } catch (error) {
    console.error('Ошибка при чтении посещений:', error);
    // Если JSON повреждён — всё равно возвращаем пустой массив
    res.json([]);
  }
});

// DELETE /api/track — очистка всех данных
app.delete('/api/track', (req, res) => {
  try {
    fs.writeFileSync(DATA_FILE, '[]');
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка при очистке данных:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Опционально: маршрут для проверки работоспособности
app.get('/', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Запуск сервера
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер запущен на http://0.0.0.0:${PORT}`);
});