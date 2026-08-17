import sys
import json
import librosa
import torch
from transformers import Wav2Vec2ForSequenceClassification, Wav2Vec2FeatureExtractor

model_name = "prithivMLmods/Speech-Emotion-Classification"
model = Wav2Vec2ForSequenceClassification.from_pretrained(model_name)
processor = Wav2Vec2FeatureExtractor.from_pretrained(model_name)

id2label = {
    0: "Anger", 1: "Calm", 2: "Disgust", 3: "Fear",
    4: "Happy", 5: "Neutral", 6: "Sad", 7: "Surprised"
}

audio_path = sys.argv[1]
speech, sr = librosa.load(audio_path, sr=16000)

inputs = processor(speech, sampling_rate=16000, return_tensors="pt", padding=True)

with torch.no_grad():
    outputs = model(**inputs)

probs = torch.nn.functional.softmax(outputs.logits, dim=1).squeeze().tolist()
result = [{"label": id2label[i], "score": probs[i]} for i in range(len(probs))]
result.sort(key=lambda x: x["score"], reverse=True)

print(json.dumps(result))