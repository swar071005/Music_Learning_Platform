from flask import Flask, request, jsonify, render_template
from acrcloud.recognizer import ACRCloudRecognizer
import json

app = Flask(__name__)

config = {
    'host': 'identify-ap-southeast-1.acrcloud.com',
    'access_key': '62d6e6a295bc1d725aa78bcd14ea7400',
    'access_secret': 'PXCYoXBLyPubGhhFpj7fhfSKngZw1vbQUiE517kE',
    'timeout': 10
}

recognizer = ACRCloudRecognizer(config)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/identify", methods=["POST"])
def identify():
    file = request.files["file"]
    filepath = "temp.mp3"
    file.save(filepath)

    result = recognizer.recognize_by_file(filepath, 0)
    print(result)  # 🔍 DEBUG

    data = json.loads(result)

    if data['status']['code'] == 0:
        music = data['metadata']['music'][0]

        return jsonify({
            "title": music['title'],
            "artist": music['artists'][0]['name'],
            "album": music.get('album', {}).get('name', 'N/A')
        })
    else:
        return jsonify({
            "error": "Song not recognized"
        })

if __name__ == "__main__":
    app.run(debug=True)
