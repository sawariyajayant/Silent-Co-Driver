# 🏎️ Silent Co-Driver

**AI-powered driver stress detection from radio calls — built for Grand Prix Hackathon (Geek Room)**

> "The radio hears everything. But engineers can't."

## The Problem

During a race, engineers are heads-down watching telemetry. They rarely have bandwidth to catch *how* a driver sounds over the radio — tired, stressed, panicked — even though vocal tone is often an early warning sign of a problem the data hasn't caught yet.

## What It Does

Silent Co-Driver takes a radio audio clip and gives engineers everything they need in seconds:

1. **What was said** — full transcript via speech-to-text
2. **How they sounded** — a mood label (Calm / Stressed / Tired / Uncertain) detected from vocal tone
3. **Whether it mattered** — the flagged lap is highlighted on a lap-time chart, with a plain-English note on whether that lap was faster or slower than average
4. **What to do about it** — an AI Race Engineer Insight combining mood + lap performance into a single actionable recommendation
5. **A running session log** — every analyzed clip is tracked with timestamp, lap, and mood, so the team can see the full picture build up over a session

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js (App Router), Tailwind CSS v4, Recharts |
| Backend | Node.js, Express |
| AI Inference | Python, Hugging Face `transformers` |
| Models | See below |

## Hugging Face Models Used

Both models are sourced from the Hugging Face Hub, satisfying the hackathon's mandatory HF requirement.

- **Transcription:** [`openai/whisper-large-v3`](https://huggingface.co/openai/whisper-large-v3) — via HF's hosted Inference API, with automatic retry on transient failures. A local fallback (`backend/transcribe.py`, using `openai/whisper-base` via `transformers`) is included in case the hosted API is unavailable during the demo.
- **Emotion detection:** [`prithivMLmods/Speech-Emotion-Classification`](https://huggingface.co/prithivMLmods/Speech-Emotion-Classification) — a wav2vec2 model trained on RAVDESS (8 emotion classes), run locally via a persistent Flask microservice (`backend/emotion_server.py`) so the model loads once and stays warm instead of reloading on every request.

## Architecture

```
Frontend (Next.js, :3000)
      │
      ▼
Backend (Express, :5000)
      │
      ├── /api/transcribe  → Hugging Face hosted API (Whisper)
      │
      └── /api/detect-mood → Local Flask server (:5001) → wav2vec2 emotion model
```

## Mood Mapping Logic

The emotion model outputs 8 raw classes (Anger, Calm, Disgust, Fear, Happy, Neutral, Sad, Surprised). We bucket these into the categories the problem statement asks for:

- **Stressed** = Anger + Happy + Fear + Surprised (high-arousal states)
- **Tired** = Sad
- **Calm** = Neutral + Calm
- **Uncertain** = shown when the winning bucket doesn't clearly beat the others (margin < 0.08), instead of forcing a low-confidence guess

*(Note: Happy is grouped into "Stressed" rather than treated as a positive signal, since in an F1 radio context, high-energy excited speech and panicked speech are acoustically similar, and a driver is essentially never communicating genuine happiness over race radio — so high arousal is treated as a flag worth reviewing.)*

## AI Race Engineer Insight

Combines the detected mood with how the selected lap's time compares to the session average, generating a plain-language recommendation — e.g.:

> Driver sounded **STRESSED** on Lap 4. Lap time was **2.30s slower** than session average (93.36s).
> Recommendation: lap was +2.30s off pace while driver sounded stressed — worth reviewing car balance for this specific lap.

## Running Locally

You'll need **3 terminals** running simultaneously:

**1. Backend (Express)**
```bash
cd backend
node index.js
```

**2. Emotion model server (Flask)**
```bash
cd backend
python emotion_server.py
```
Wait for `Model loaded. Ready.` before using the app.

**3. Frontend (Next.js)**
```bash
cd frontend
npm run dev
```

Then open `http://localhost:3000`.

## Setup

**Backend:**
```bash
cd backend
npm install
pip install flask transformers torch librosa
```
Create a `.env` file in `backend/` with:
```
HF_TOKEN=your_hugging_face_token_here
```

**Frontend:**
```bash
cd frontend
npm install
```

## Known Limitations

- Lap-time data shown on the dashboard is representative mock data, not a live telemetry feed. In production, this would be pulled from the team's real timing system, matched to radio clips by timestamp.
- The emotion model was trained on RAVDESS (scripted, acted emotional speech), so it generalizes well to clearly-toned speech but can conflate high-energy states — e.g. frustration or focused/animated speech can register similarly to genuine stress, since both involve fast pace and raised pitch. This is a known limitation of off-the-shelf speech emotion recognition models generally (the arousal-valence confusion). Our "Uncertain" fallback helps surface genuinely ambiguous readings rather than forcing a confident-but-wrong label.
- Lap correlation currently requires manually selecting which lap a clip belongs to; a production version would sync this automatically via timestamps.

## What We'd Build Next

- **Radio issue detection** — keyword-matching on the transcript to flag what the driver is discussing (tyres, brakes, rear instability, etc.)
- **Stress timeline** — segment-level analysis showing how stress changes second-by-second through a call, instead of one label per clip
- **Driver-specific baselines** — comparing a driver's current tone against their own personal norm, since vocal intensity varies naturally by person
- Fine-tuning the emotion model on real racing radio audio instead of acted RAVDESS clips, to reduce the arousal-valence confusion


## Hackathon

Built for **Grand Prix**, Geek Room's AI hackathon — Online Qualifier, with the top team advancing to the TrackShift × TGR HAAS F1 Hackathon Grand Finale.
