import sys
import json
from transformers import pipeline

transcriber = pipeline("automatic-speech-recognition", model="openai/whisper-base")

audio_path = sys.argv[1]
result = transcriber(audio_path)

print(json.dumps({"text": result["text"]}))