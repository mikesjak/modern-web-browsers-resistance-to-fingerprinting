let displayedCanvas = false;

/**
 * This function asynchronously generates a SHA256 hash of a given HTML canvas element. 
 * It first converts the canvas to a Base64-encoded PNG image URL, then strips the URL prefix to get the raw Base64 string. 
 * This string is decoded into a binary representation, which is then passed to a sha256 hashing function. 
 * The function returns 
 * @param {HTMLCanvasElement} canvas element to hash
 * @returns {Promise<String>} A promise that resolves to the SHA256 hash string, providing a unique identifier for the canvas content.
 */
async function hashCanvas(canvas) {
    let b64 = canvas.toDataURL().replace("data:image/png;base64,", "");
    let bin = atob(b64);
    let hash = await sha256(bin);
    return hash;
}

/**
 * This function draws text and emojis onto a canvas
 * @param {HTMLCanvasElement} canvas unused parameter, cannot be deleted IDK WHY
 * @param {CanvasRenderingContext2D} ctx canvas context essential for defining the visual content of the canvas
 */
function createTextCanvas(canvas, ctx) {
    // Text canvas
    const txt = "juoqgcsx@$?! 01235689";
    ctx.textBaseline = "top";
    ctx.font = "14px 'Times New Roman'"; // Important to use commonly installed font
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(100, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText(txt, 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText(txt, 4, 17);

    // Add an emoji
    ctx.font = "18px 'Times New Roman'"; // You might need to adjust the font size
    ctx.fillText(String.fromCharCode(55357, 56835), 200, 30); // Position the emoji on the canvas
}

/**
 * This function orchestrates the creation of a text-containing canvas element and computes its SHA256 hash
 * It starts by dynamically generating a canvas and setting its dimensions. 
 * Utilizing the createTextCanvas function, it populates the canvas with predefined text and an emoji. 
 * Following this, it uses the hashCanvas function to asynchronously generate a SHA256 hash of the canvas's content. 
 * @returns {Promise<[HTMLCanvasElement, string]>} A promise of the canvas element and its corresponding hash
 */
async function handleTextCanvas() {
    let canvas = document.createElement('canvas');
    canvas.width = 240; 
    canvas.height = 60; 
    let ctx = canvas.getContext('2d');

    createTextCanvas(canvas, ctx);
    let hash = await hashCanvas(canvas);

    return [canvas, hash];
}

/**
 * Create geometric/WebGL canvas, demonstrates the blending and winding techniques on a canvas through the drawing of intersecting circles.
 * Blending is achieved using the 'multiply' composite operation, 
 * creating an area where three circles of primary colors intersect, resulting in a visual mix. 
 * The winding test involves a pink ring, showcasing how canvas fills shapes based on the 'evenodd' rule, 
 * differentiating the inner and outer areas of the ring. 
 * This function is a practical application of canvas graphics operations, illustrating complex visual effects.
 * @param {CanvasRenderingContext2D} ctx canvas context
 */
function createGeomCanvas(ctx) {
    // Blending
    // https://web.archive.org/web/20170826194121/http://blogs.adobe.com/webplatform/2013/01/28/blending-features-in-canvas/
    // http://jsfiddle.net/NDYV8/16/
    ctx.globalCompositeOperation = 'multiply'
    
    const blending = [
        ['#f0f', 40, 40],
        ['#0ff', 80, 40],
        ['#ff0', 60, 80],
    ];
    
    for (const [color, x, y] of blending) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 40, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
    }
    

    // Canvas winding
    // https://web.archive.org/web/20130913061632/http://blogs.adobe.com/webplatform/2013/01/30/winding-rules-in-canvas/
    // http://jsfiddle.net/NDYV8/19/
    ctx.fillStyle = '#f9c'
    ctx.arc(60, 60, 60, 0, Math.PI * 2, true)
    ctx.arc(60, 60, 20, 0, Math.PI * 2, true)
    ctx.fill('evenodd') // nonzero getting more realistic results, evenodd has more entropy
}

/**
 * This function encapsulates the process of creating a canvas for geometric (WebGL) content.
 * After setting up the canvas and invoking createGeomCanvas to apply the visual elements, it computes a SHA256 hash of the canvas content using hashCanvas. 
 * This function effectively combines the creation of visually complex canvas graphics with the generation of a cryptographic hash, 
 * returning both 
 * @returns {Promise<[HTMLCanvasElement, string]>} Promise of the canvas element and its hash as a tuple
 */
async function handleGeomCanvas() {
    let canvas = document.createElement('canvas');
    canvas.width = 120; 
    canvas.height = 120; 
    let ctx = canvas.getContext('2d');

    createGeomCanvas(ctx);
    let hash = await hashCanvas(canvas);

    return [canvas, hash];
}

/**
 * This function showcases two canvas elements
 * one for text and another for geometric or WebGL content alongside their respective SHA256 hashes.
 * It dynamically updates the webpage to include these elements and their hashes, 
 * organizing them under an unified "Canvas" header for easy comparison and analysis. 
 * @param {HTMLCanvasElement} txtCanvas text canvas
 * @param {HTMLCanvasElement} geomCanvas geometric canvas
 * @param {string} txtHash SHA256 hash of text canvas
 * @param {string} geomHash SHA256 hash of geometric canvas
 */
function displayCanvas(txtCanvas, geomCanvas, txtHash, geomHash) {
    if ( displayedCanvas == true ) return;
    displayedCanvas = true;

    let headerElement = document.createElement('h2');
    headerElement.textContent = 'Canvas';

    let txtHashElement = document.createElement('p');
    txtHashElement.textContent = 'Hash: ' + txtHash;

    let geomHashElement = document.createElement('p');
    geomHashElement.textContent = 'Hash: ' + geomHash;

    let canvasDiv = document.getElementById('canvasDisplay');
    let txtCanvasDiv = document.getElementById('textCanvas');
    let geomCanvasDiv = document.getElementById('geomCanvas');

    canvasDiv.innerHTML = '';

    canvasDiv.appendChild(headerElement);

    if (txtCanvasDiv) {
        txtCanvasDiv.appendChild(txtCanvas);
        txtCanvasDiv.appendChild(txtHashElement);
    }

    if (geomCanvasDiv) {
        geomCanvasDiv.appendChild(geomCanvas);
        geomCanvasDiv.appendChild(geomHashElement);
    }

    if (txtCanvasDiv) {
        canvasDiv.appendChild(txtCanvasDiv);
    }
    if (geomCanvasDiv) {
        canvasDiv.appendChild(geomCanvasDiv);
    }
}

/**
 * This function orchestrates the creation, processing, and display of both text and geometric canvases, concluding with the calculation of their SHA256 checksums. 
 * After generating each canvas and obtaining their checksums via handleTextCanvas and handleGeomCanvas, it visualizes the canvases and their hashes on the webpage through displayCanvas. 
 * Finally, it compiles the checksums into a dictionary object for return, providing a structured summary of the canvases' content integrity indicators.
 * @returns {Promise<Dictionary<String, String>>} A promise of a dictionary containing text and geometric canvas CRC sums.
 */
async function canvasInit() {
    let data = new Object();
    let [txtCanvas, txtCRC] = await handleTextCanvas();
    let [geomCanvas, geomCRC] = await handleGeomCanvas();

    displayCanvas(txtCanvas, geomCanvas, txtCRC, geomCRC);

    data["txtCanvas"] = txtCRC;
    data["geomCanvas"] = geomCRC;

    return data;
}
