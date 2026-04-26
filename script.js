
// 🎵 NaadStudio Tanpura Player

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

let tanpuraBuffer = null;
let tanpuraSource = null;
let gainNode = null;

// Load selected tanpura scale
async function loadTanpura(scale) {

    try {

        const response = await fetch(`sounds/tanpura/${scale}.wav`);

        if (!response.ok) {
            throw new Error("File not found");
        }

        const arrayBuffer = await response.arrayBuffer();
        tanpuraBuffer = await audioContext.decodeAudioData(arrayBuffer);

    } catch (error) {

        console.error("Tanpura loading error:", error);
        alert("Tanpura audio file not found for scale: " + scale);

    }

}


// ▶ Start Tanpura
async function startTanpura() {

    const scale = document.getElementById("scaleSelect").value;

    if (!scale) {
        alert("Please select a scale.");
        return;
    }

    // Resume audio context (required by browser)
    await audioContext.resume();

    // If already playing stop first
    if (tanpuraSource) {
        stopTanpura();
    }

    await loadTanpura(scale);

    if (!tanpuraBuffer) return;

    tanpuraSource = audioContext.createBufferSource();
    gainNode = audioContext.createGain();

    tanpuraSource.buffer = tanpuraBuffer;
    tanpuraSource.loop = true;

    // Smooth fade in
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 2);

    tanpuraSource.connect(gainNode);
    gainNode.connect(audioContext.destination);

    tanpuraSource.start();

}


// ⏹ Stop Tanpura
function stopTanpura() {

    if (!tanpuraSource) return;

    // Smooth fade out
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);

    setTimeout(() => {

        if (tanpuraSource) {
            tanpuraSource.stop();
            tanpuraSource.disconnect();
        }

        if (gainNode) {
            gainNode.disconnect();
        }

        tanpuraSource = null;
        gainNode = null;

    }, 2000);

}


// 🔄 Change scale automatically
document.addEventListener("DOMContentLoaded", () => {

    const scaleSelect = document.getElementById("scaleSelect");

    scaleSelect.addEventListener("change", () => {

        if (tanpuraSource) {

            stopTanpura();

            setTimeout(() => {
                startTanpura();
            }, 2000);

        }

    });

});


//Tabla player for Indian classical music practice
const taals = {
    teentaal: {
        bols: [
            "dha","dhin","dhin","dha",
            "dha","dhin","dhin","dha",
            "dha","tin","tin","na",
            "na","dhin","dhin","dha"
        ],
        samIndex: 0
    },
    dadra: {
        bols: ["dha","dhin","na","dha","tin","na"],
        samIndex: 0
    },
    keharwa: {
        bols: ["dha","ge","na","ti","na","ka","dhi","na"],
        samIndex: 0
    }
};

let currentTaal;
let currentIndex = 0;
let intervalID;

function startTaal(taalName, bpm) {
    currentTaal = taals[taalName];
    currentIndex = 0;

    let interval = 60000 / bpm;

    intervalID = setInterval(() => {
        let bol = currentTaal.bols[currentIndex];
        playBol(bol);

        highlightBol(currentIndex);

        currentIndex = (currentIndex + 1) % currentTaal.bols.length;
    }, interval);
}

function highlightBol(index) {
    const display = document.getElementById("taal-display");

    display.innerHTML = currentTaal.bols.map((b, i) => {
        if (i === currentTaal.samIndex) {
            return `<span style="color:red; font-weight:bold;">${b}</span>`;
        }
        if (i === index) {
            return `<span style="color:blue;">${b}</span>`;
        }
        return b;
    }).join(" ");
}


//Analyze pitch accuracy of a recorded note against a reference frequency
let suggestion = "";

if (Math.abs(diff) < 5) {
    suggestion = "Great! Maintain this pitch.";
} 
else if (diff > 0) {
    suggestion = "Try singing slightly lower.";
} 
else {
    suggestion = "Try singing slightly higher.";
}

document.getElementById("result").innerHTML =
    `Detected Frequency: ${freq.toFixed(2)} Hz <br>
     Accuracy: ${accuracy}% <br>
     ${feedback} <br>
     💡 ${suggestion}`;


function detectPitch(buffer, sampleRate) {

    let SIZE = buffer.length;
    let bestOffset = -1;
    let bestCorrelation = 0;

    let maxOffset = 300; // 🔥 LIMIT (VERY IMPORTANT)

    for (let offset = 8; offset < maxOffset; offset++) {

        let correlation = 0;

        for (let i = 0; i < 500; i++) { // 🔥 SMALL LOOP
            correlation += Math.abs(buffer[i] - buffer[i + offset] || 0);
        }

        correlation = 1 - (correlation / 500);

        if (correlation > bestCorrelation) {
            bestCorrelation = correlation;
            bestOffset = offset;
        }
    }

    if (bestOffset > 0) {
        return sampleRate / bestOffset;
    }

    return -1;
}




