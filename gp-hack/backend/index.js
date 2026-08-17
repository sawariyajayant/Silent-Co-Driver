require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

const HF_TOKEN = process.env.HF_TOKEN;
const WHISPER_URL = 'https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3';
const EMOTION_URL = 'https://router.huggingface.co/hf-inference/models/Dpngtm/wav2vec2-emotion-recognition';

async function fetchWithRetry(url, options, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      if (i === retries) return res;
    } catch (err) {
      if (i === retries) throw err;
    }
    await new Promise(r => setTimeout(r, 3000));
  }
}

app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const audioBuffer = req.file.buffer;

    const response = await fetchWithRetry(WHISPER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'audio/mpeg',
      },
      body: audioBuffer,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('HF error:', errText);
      return res.status(500).json({ error: 'Transcription service error' });
    }
    const result = await response.json();
    res.json({ text: result.text || 'No transcription returned' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

app.post('/api/detect-mood', upload.single('audio'), async (req, res) => {
  try {
    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: 'audio/mpeg' });
    formData.append('audio', blob, 'audio.mp3');

    const response = await fetch('http://localhost:5001/predict', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    function mapMood(scores) {
  const byLabel = {};
  scores.forEach(s => byLabel[s.label] = s.score);

  const stressScore = (byLabel.Anger || 0) + (byLabel.Happy || 0) + (byLabel.Fear || 0) + (byLabel.Surprised || 0);
  const tiredScore = byLabel.Sad || 0;
  const calmScore = (byLabel.Neutral || 0) + (byLabel.Calm || 0);

  const scoresSorted = [stressScore, tiredScore, calmScore].sort((a, b) => b - a);
  const margin = scoresSorted[0] - scoresSorted[1];

  if (margin < 0.08) return 'Uncertain';
  if (stressScore > tiredScore && stressScore > calmScore) return 'Stressed';
  if (tiredScore > calmScore) return 'Tired';
  return 'Calm';
}

    const mood = mapMood(result);
    res.json({ mood, raw: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Emotion detection failed' });
  }
});

app.listen(5000, () => console.log('Backend running on port 5000'));