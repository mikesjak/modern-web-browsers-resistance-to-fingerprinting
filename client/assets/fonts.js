/**
 * This function asynchronously assesses the availability of a predefined set of common fonts in the user's browser
 * using the CSS-based font detection method.
 * @returns {Promise<Array>} An array of objects containing font name, width, and height
 */
async function checkFonts() {
    let fontSet = new Set(commonFonts);
    let detector = new Detector(); // Initialize the font detector
    let availableFonts = [];

    for (let font of fontSet.values()) {
        let result = detector.detect(font);
        if (result.detected) {
            availableFonts.push({
                name: font,
                width: result.width,
                height: result.height
            });
        }
    }

    return availableFonts;
}

/**
 * This function dynamically updates a specified display area on the webpage to list the names of fonts
 * in their actual styles as detected, along with their measured width and height.
 * @param {Array} availableFonts An array of objects containing font name, width, and height
 */
function displayAvailableFonts(availableFonts) {
    let displayArea = document.getElementById("FontsDisplay");
    displayArea.innerHTML = "<h1>Available Fonts</h1>";

    var testString = "mmmmmmmmmmlli";

    for (let fontData of availableFonts) {
        let fontElement = document.createElement("p");
        fontElement.textContent = `${testString} ${fontData.name} (W: ${fontData.width}px, H: ${fontData.height}px)`;
        fontElement.style.fontFamily = `"${fontData.name}", sans-serif`; // Apply detected font
        fontElement.style.fontSize = "16px"; // Normal readable size
        fontElement.style.margin = "4px 0"; // Some spacing between fonts
        displayArea.appendChild(fontElement);
    }
}

/**
 * This function orchestrates the process of identifying available common fonts, displaying them,
 * and generating a SHA256 hash of the set.
 * @returns {Promise<String>} A SHA256 hash of the set of available fonts
 */
async function handleFonts() {
    let availableFonts = await checkFonts();
    displayAvailableFonts(availableFonts);

    let fonts_str = availableFonts.map(f => f.name).join('');
    return sha256(fonts_str);
}

/**
 * CSS-based font detection class
 */
var Detector = function () {
    var baseFonts = ['monospace', 'sans-serif', 'serif'];
    var testString = "mmmmmmmmmmlli";
    var testSize = '72px';
    var body = document.getElementsByTagName("body")[0];

    var span = document.createElement("span");
    span.style.fontSize = testSize;
    span.innerHTML = testString;
    span.style.position = "absolute"; // Prevent layout shift
    span.style.visibility = "hidden"; // Hide from user

    var defaultWidth = {};
    var defaultHeight = {};

    for (var font of baseFonts) {
        span.style.fontFamily = font;
        body.appendChild(span);
        defaultWidth[font] = span.offsetWidth;
        defaultHeight[font] = span.offsetHeight;
        body.removeChild(span);
    }

    this.detect = function (font) {
        var detected = false;
        var width = 0, height = 0;
       
        for (var baseFont of baseFonts) {
            span.style.fontFamily = font + ',' + baseFont;
            body.appendChild(span);
            let matched = (span.offsetWidth !== defaultWidth[baseFont] || span.offsetHeight !== defaultHeight[baseFont]);
            detected = detected || matched;

            if (matched) {
                width = span.offsetWidth;
                height = span.offsetHeight;
            }
           
            body.removeChild(span);
        }

        return { detected, width, height };
    };
};

/**
 * List of common fonts from Windows and macOS
 */
const commonFonts = [
    'American Typewriter', 'Andale Mono', 'Arial Black', 'Arial Hebrew', 'Arial Narrow',
    'Arial Rounded MT Bold', 'Arial Unicode MS', 'Arial', 'Avenir Next Condensed', 'Avenir Next',
    'Avenir', 'Bahnschrift', 'Baskerville', 'Big Caslon', 'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps',
    'Bodoni 72', 'Bradley Hand', 'Brush Script MT', 'Calibri', 'Cambria Math', 'Cambria', 'Candara',
    'Chalkboard SE', 'Chalkboard', 'Chalkduster', 'Charter', 'Cochin', 'Comic Sans MS', 'Consolas',
    'Constantia', 'Copperplate', 'Corbel', 'Courier New', 'Courier', 'DIN Alternate', 'DIN Condensed',
    'Didot', 'Ebrima', 'Franklin Gothic Medium', 'Futura', 'Gabriola', 'Gadugi', 'Geneva', 'Georgia',
    'Gill Sans', 'Helvetica Neue', 'Helvetica', 'Herculanum', 'Hoefler Text', 'HoloLens MDL2 Assets',
    'Impact', 'Ink Free', 'Javanese Text', 'LUCIDA GRANDE', 'Leelawadee UI', 'Lucida Console',
    'Lucida Grande', 'Lucida Sans Unicode', 'Luminari', 'MS Gothic', 'MV Boli', 'Malgun Gothic',
    'Marker Felt', 'Marlett', 'Menlo', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft New Tai Lue',
    'Microsoft PhagsPa', 'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft YaHei', 'Microsoft Yi Baiti',
    'MingLiU-ExtB', 'Monaco', 'Mongolian Baiti', 'Myanmar Text', 'Nirmala UI', 'Noteworthy', 'Optima',
    'Palatino Linotype', 'Palatino', 'Papyrus', 'Phosphate', 'Rockwell', 'Savoye LET', 'Segoe MDL2 Assets',
    'Segoe Print', 'Segoe Script', 'Segoe UI Emoji', 'Segoe UI Historic', 'Segoe UI Symbol', 'Segoe UI',
    'SignPainter', 'SimSun', 'Sitka', 'Skia', 'Snell Roundhand', 'Sylfaen', 'Symbol', 'Tahoma',
    'Times New Roman', 'Times', 'Trattatello', 'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings 2',
    'Wingdings 3', 'Wingdings', 'Yu Gothic', 'Zapfino',
];