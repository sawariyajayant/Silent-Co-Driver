from flask import Flask, request, jsonify
from transformers import Wav2Vec2ForSequenceClassification, Wav2Vec2FeatureExtractor
import librosa
import torch

app = Flask(__name__)

model_name = "prithivMLmods/Speech-Emotion-Classification"
model = Wav2Vec2ForSequenceClassification.from_pretrained(model_name)
processor = Wav2Vec2FeatureExtractor.from_pretrained(model_name)

id2label = {
    0: "Anger", 1: "Calm", 2: "Disgust", 3: "Fear",
    4: "Happy", 5: "Neutral", 6: "Sad", 7: "Surprised"
}

print("Model loaded. Ready.")

@app.route('/predict', methods=['POST'])
def predict():
    audio_file = request.files['audio']
    audio_file.save('temp_incoming.mp3')

    speech, sr = librosa.load('temp_incoming.mp3', sr=16000)
    inputs = processor(speech, sampling_rate=16000, return_tensors="pt", padding=True)

    with torch.no_grad():
        outputs = model(**inputs)

    probs = torch.nn.functional.softmax(outputs.logits, dim=1).squeeze().tolist()
    result = [{"label": id2label[i], "score": probs[i]} for i in range(len(probs))]
    result.sort(key=lambda x: x["score"], reverse=True)

    return jsonify(result)

if __name__ == '__main__':
    app.run(port=5001)