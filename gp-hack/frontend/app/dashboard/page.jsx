'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const moodStyles = {
  Calm: { color: '#4ADE80', label: 'CALM' },
  Stressed: { color: '#FF1E1E', label: 'STRESSED' },
  Tired: { color: '#FACC15', label: 'TIRED' },
  Uncertain: { color: '#B8B8B8', label: 'UNCERTAIN — LOW CONFIDENCE' },
};

function getRecommendation(mood, delta) {
    if (mood === 'Uncertain') {
    return 'The model wasn\'t confident enough to classify this clip reliably — treat this reading with caution.';
  }
  const magnitude = Math.abs(delta);
  const isSlower = delta > 0;
  const sign = isSlower ? '+' : '-';

  if (mood === 'Stressed') {
    if (isSlower) {
      return `Recommendation: lap was ${sign}${magnitude.toFixed(2)}s off pace while driver sounded stressed — worth reviewing car balance for this specific lap.`;
    }
    return `Recommendation: driver sounded stressed but still ran ${magnitude.toFixed(2)}s under average — stress hasn't hit performance yet, keep monitoring.`;
  }

  if (mood === 'Tired') {
    if (isSlower) {
      return `Recommendation: fatigue and a ${sign}${magnitude.toFixed(2)}s slower lap together — consider a driver check-in on the next radio call.`;
    }
    return `Recommendation: driver sounds tired despite a ${magnitude.toFixed(2)}s faster lap — check in regardless, fatigue often shows before pace drops.`;
  }

  // Calm
  if (isSlower) {
    return `Recommendation: driver composed, but lap was still ${sign}${magnitude.toFixed(2)}s off pace — likely a track/traffic factor rather than driver state.`;
  }
  return `No immediate concern — driver composed and lap time ${magnitude.toFixed(2)}s under session average.`;
}


const lapTimes = [
  { lap: 1, time: 92.4 },
  { lap: 2, time: 91.8 },
  { lap: 3, time: 93.1 },
  { lap: 4, time: 95.6 },
  { lap: 5, time: 94.2 },
  { lap: 6, time: 92.9 },
  { lap: 7, time: 93.5 },
];

const avgLapTime = lapTimes.reduce((sum, l) => sum + l.time, 0) / lapTimes.length;

function HudPanel({ children, className = '' }) {
  return (
    <div className={`relative bg-surface-container border border-outline p-6 ${className}`}>
      <div className="absolute top-[-1px] left-[-1px] w-2 h-2 border-t border-l border-text-dim" />
      <div className="absolute top-[-1px] right-[-1px] w-2 h-2 border-t border-r border-text-dim" />
      <div className="absolute bottom-[-1px] left-[-1px] w-2 h-2 border-b border-l border-text-dim" />
      <div className="absolute bottom-[-1px] right-[-1px] w-2 h-2 border-b border-r border-text-dim" />
      {children}
    </div>
  );
}

function CustomDot(props) {
  const { cx, cy, payload, selectedLap, moodColor } = props;
  if (payload.lap === selectedLap && moodColor) {
    return <circle cx={cx} cy={cy} r={7} fill={moodColor} stroke="#fff" strokeWidth={1.5} />;
  }
  return <circle cx={cx} cy={cy} r={4} fill="#FF1E1E" />;
}

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [mood, setMood] = useState('');
  const [selectedLap, setSelectedLap] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionLog, setSessionLog] = useState([]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setAudioUrl(URL.createObjectURL(selected));
      setTranscript('');
      setMood('');
      setError('');
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError('');

    try {
      const formData1 = new FormData();
      formData1.append('audio', file);
      const transcribeRes = await fetch('http://localhost:5000/api/transcribe', {
        method: 'POST',
        body: formData1,
      });
      const transcribeData = await transcribeRes.json();
      setTranscript(transcribeData.text);

      const formData2 = new FormData();
      formData2.append('audio', file);
      const moodRes = await fetch('http://localhost:5000/api/detect-mood', {
        method: 'POST',
        body: formData2,
      });
      const moodData = await moodRes.json();
      setMood(moodData.mood);
      setSessionLog((prev) => [
  {
    lap: selectedLap,
    mood: moodData.mood,
    transcript: transcribeData.text,
    timestamp: new Date().toLocaleTimeString(),
  },
  ...prev,
]);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const activeMood = moodStyles[mood];
  const selectedLapData = lapTimes.find((l) => l.lap === selectedLap);
  const delta = selectedLapData ? (selectedLapData.time - avgLapTime).toFixed(2) : null;
  const isSlower = delta > 0;

  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-12 md:px-16 font-sans">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-2 h-2 rounded-full bg-racing-red animate-pulse" />
        <span className="font-mono text-[11px] tracking-[0.2em] text-racing-red uppercase">
          AI Race Intelligence
        </span>
      </div>
      <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-racing-red mb-12">
        Silent Co-Driver — Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* Upload panel */}
        <HudPanel className="flex flex-col gap-4">
          <h2 className="font-mono text-[11px] tracking-[0.2em] text-text-dim uppercase">Radio Clip</h2>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-surface-container-high file:text-foreground file:uppercase file:text-xs file:tracking-widest"
          />
          {audioUrl && <audio controls src={audioUrl} className="w-full mt-2" />}

          <label className="font-mono text-[11px] tracking-[0.2em] text-text-dim uppercase mt-2">
            Which lap is this clip from?
          </label>
          <select
            value={selectedLap}
            onChange={(e) => setSelectedLap(Number(e.target.value))}
            className="bg-surface-container-high text-foreground text-sm p-2 border border-outline font-mono w-fit"
          >
            {lapTimes.map((l) => (
              <option key={l.lap} value={l.lap}>
                Lap {l.lap}
              </option>
            ))}
          </select>

          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            className="mt-4 bg-racing-red text-white uppercase font-mono text-sm tracking-widest px-6 py-4 disabled:opacity-30 hover:bg-racing-red-container transition-colors shadow-[0_0_15px_rgba(255,30,30,0.3)]"
          >
            {loading ? 'Analyzing...' : 'Analyze Clip'}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </HudPanel>

        {/* Results panel */}
        <HudPanel className="flex flex-col gap-4">
          <h2 className="font-mono text-[11px] tracking-[0.2em] text-text-dim uppercase">Transcript</h2>
          <p className="text-sm text-foreground min-h-[3em] leading-relaxed">
            {transcript || '—'}
          </p>

          <h2 className="font-mono text-[11px] tracking-[0.2em] text-text-dim uppercase mt-2">Vocal State</h2>
          {activeMood ? (
            <span
              className="inline-block w-fit px-4 py-2 border font-mono text-sm uppercase tracking-widest"
              style={{ color: activeMood.color, borderColor: activeMood.color }}
            >
              {activeMood.label}
            </span>
          ) : (
            <p className="text-sm text-text-dim">—</p>
          )}
        </HudPanel>

        {/* Lap chart */}
        <HudPanel className="md:col-span-2">
          <h2 className="font-mono text-[11px] tracking-[0.2em] text-text-dim uppercase mb-4">Lap Times</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lapTimes}>
              <CartesianGrid stroke="#2a2a2a" />
              <XAxis dataKey="lap" stroke="#707070" tick={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
              <YAxis stroke="#707070" domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1c1b1b', border: '1px solid #2a2a2a', fontFamily: 'var(--font-mono)' }} />
              <Line
                type="monotone"
                dataKey="time"
                stroke="#FF1E1E"
                strokeWidth={2}
                dot={(props) => (
                  <CustomDot
                    key={props.payload.lap}
                    {...props}
                    selectedLap={mood ? selectedLap : null}
                    moodColor={activeMood?.color}
                  />
                )}
              />
            </LineChart>
          </ResponsiveContainer>

          {activeMood && selectedLapData && (
  <div
    className="mt-4 p-5 border font-mono text-sm leading-relaxed"
    style={{ borderColor: activeMood.color, color: activeMood.color }}
  >
    <div className="uppercase tracking-widest text-xs mb-2 opacity-80">
      ⚠ Race Engineer Insight
    </div>
    <p className="text-foreground">
      Driver sounded <strong style={{ color: activeMood.color }}>{activeMood.label}</strong> on
      Lap {selectedLap}. Lap time was <strong>{Math.abs(delta)}s {isSlower ? 'slower' : 'faster'}</strong> than
      session average ({avgLapTime.toFixed(2)}s).
    </p>
    <p className="text-text-muted mt-2">
      {getRecommendation(mood, delta)}
    </p>
  </div>
)}
        </HudPanel>
        {sessionLog.length > 0 && (
  <HudPanel className="md:col-span-2 mt-6">
    <h2 className="font-mono text-[11px] tracking-[0.2em] text-text-dim uppercase mb-4">
      Session Log
    </h2>
    <div className="flex flex-col gap-2">
      {sessionLog.map((entry, i) => (
        <div
          key={i}
          className="flex justify-between items-center border-b border-outline pb-2 text-sm"
        >
          <span className="text-text-muted font-mono text-xs">{entry.timestamp}</span>
          <span className="text-foreground font-mono">Lap {entry.lap}</span>
          <span
            className="font-mono uppercase text-xs px-2 py-1 border"
            style={{ color: moodStyles[entry.mood]?.color, borderColor: moodStyles[entry.mood]?.color }}
          >
            {entry.mood}
          </span>
        </div>
      ))}
    </div>
  </HudPanel>
)}
      </div>
    </div>
    
  );
}