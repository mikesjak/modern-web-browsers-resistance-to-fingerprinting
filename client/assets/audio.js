/**
 * This function serves as a comprehensive approach to generating an audio fingerprint of the user's device using the browser's Audio API. 
 * It begins by asynchronously obtaining audio samples through the `getAudioSamples` function. 
 * Then, it processes these samples to create both a simple hash and a more secure SHA256 hash using the `audioHash` function. 
 * The results, along with the original audio samples, are displayed via the `displayAudio` function. 
 * Finally, the SHA256 hash is returned, providing a unique identifier based on the audio capabilities of the user's device.
 * @returns {Promise<String>} a promise of SHA256 hash of audio data
 */
async function audioInit() {
    let samples = await getAudioSamples();

    if ( samples == false ) {
        return noData;
    }

    let hash, shaHash;
    [hash, shaHash] = await audioHash(samples);

    displayAudio(hash, shaHash, samples);

    return shaHash;
}

/**
 * This function utilizes the Web Audio API to generate a unique set of audio samples, employing an oscillator and a dynamics compressor to shape the sound. 
 * It creates an audio context for offline processing, allowing for sample generation without actual audio playback. 
 * The audio signal is rendered to a buffer, from which audio samples are extracted and returned as an array of float values.
 * @returns {Promise<Array<Float>>} Promise of array of float values representing sound samples
 */
async function getAudioSamples() {
    let AudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;

    if (typeof AudioContext !== "function") {
        return false;
    }

    const numOfSamples = 4000;
    const samplesPerSec = 44000;

    let audioCtx = new AudioContext(1, numOfSamples, samplesPerSec);
    let oscillator = audioCtx.createOscillator();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(500, audioCtx.currentTime);

    let compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.value = -50;
    compressor.knee.value = 35;
    compressor.ratio.value = 15;
    compressor.reduction.number = 20;
    compressor.attack.value = 0;
    compressor.release.value = 0.2;

    oscillator.connect(compressor);
    compressor.connect(audioCtx.destination);
    oscillator.start(0);

    let buffer;
    buffer = await renderAudio(audioCtx);

    compressor.disconnect();
    oscillator.disconnect();

    let samples = buffer.getChannelData(0);

    return samples;
}

/**
 * This function initiates the rendering process for audio content in a given AudioContext. 
 * It encapsulates this process within a Promise, resolving with the rendered audio buffer upon successful completion. 
 * The function employs error handling to catch and reject errors in case the rendering fails, ensuring robust operation.
 * @param {AudioContext} context an AudioContext object used for processing and rendering audio data
 * @returns {Promise<AudioBuffer>} a Promise that resolves with the renderedBuffer, which contains the processed audio samples
 */
async function renderAudio(context) {
    return new Promise((resolve, reject) => {
        // Set the oncomplete event handler to resolve the promise with the rendered audio buffer
        context.oncomplete = (event) => resolve(event.renderedBuffer);
  
        // Attempt to start rendering. If it fails immediately (e.g., due to misconfiguration), catch the error.
        try {
            context.startRendering();
        } 
        catch (e) {
            reject(e);
        }
    });
}

/**
 * This function visualizes audio sample data and displays hash values associated with these samples. 
 * It creates a visual representation of a segment of the audio samples using the createAudioCanvas function,
 * then dynamically generates HTML elements to display the hashes (hash and shaHash) alongside the visualized audio data. 
 * The visual representation and hash values are inserted into specific HTML elements identified by their IDs, 
 * allowing for an interactive and informative display of the audio fingerprinting process.
 * @param {string} hash sum of all sound samples
 * @param {string} shaHash SHA256 hash of sum of all sound samples
 * @param {Array{float}} samples sound samples created via Audio API oscillator
 */
function displayAudio(hash, shaHash, samples) {
    let audioCanvas = createAudioCanvas(samples, 3000, 3300);

    let headerElement = document.createElement('h2');
    headerElement.textContent = 'Audio';

    let audioHashElement = document.createElement('p');
    audioHashElement.textContent = 'Hash: ' + hash;

    let audioShaHashElement = document.createElement('p');
    audioShaHashElement.textContent = 'SHA256: ' + shaHash;

    let canvasDiv = document.getElementById('audioCanvas');
    let hashDiv = document.getElementById('audioHash');

    canvasDiv.innerHTML = '';
    hashDiv.innerHTML = '';

    canvasDiv.appendChild(headerElement);

    if (canvasDiv) {
        canvasDiv.appendChild(audioCanvas);
    }

    if (hashDiv) {
        canvasDiv.appendChild(audioHashElement);
        canvasDiv.appendChild(audioShaHashElement);
    }
}

/**
 * This function dynamically creates a canvas element to visually represent a segment of audio samples between specified start and end indexes. 
 * The waveform is plotted by connecting points derived from the audio sample values, translating these into visual coordinates on the canvas. 
 * This visual representation aids in understanding the characteristics of the audio data, providing a graphical interpretation of the sound samples.
 * @param {AudioBuffer} samples Sound samples
 * @param {Int} startIndex Index to start visualisation from
 * @param {Int} endIndex Index to end visualisation at
 * @returns {HTMLCanvasElement} Canvas with audio visualisation
 */
function createAudioCanvas(samples, startIndex, endIndex) {
    const width = 800;
    const height = 200;

    let canvas = document.createElement('canvas');
    canvas.width = width;  // Set the canvas width
    canvas.height = height;  // Set the canvas height

    let canvasCtx = canvas.getContext('2d');
  
    let sampleCount = endIndex - startIndex + 1;
    let xIncrement = width / sampleCount;

    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    canvasCtx.fillStyle = 'white';
    canvasCtx.fillRect(0, 0, width, height);
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'blue';
    canvasCtx.beginPath();

    canvasCtx.beginPath();
    canvasCtx.moveTo(0, height / 2);

    for (let i = startIndex; i <= endIndex; i++) {
        let x = (i - startIndex) * xIncrement;
        let y = (height / 2) * (1 - samples[i]);
        canvasCtx.lineTo(x, y);
    }

    canvasCtx.strokeStyle = 'blue'; // Set the color of the line
    canvasCtx.lineWidth = 1; // Set the line width
    canvasCtx.stroke(); // Render the line

    return canvas;
} 
