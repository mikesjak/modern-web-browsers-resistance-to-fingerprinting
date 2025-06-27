const noData = "Not available";


async function collectData() {
    let data = new Object();

    let canvas = await canvasInit();
    let attributes = await dataInit(); 

    data["Attributes"] = attributes[0];
    data["AttributesHash"] = attributes[1];
    data["Audio"] = await audioInit();
    data["Fonts"] = await handleFonts();
    data["Geom Canvas"] = canvas["geomCanvas"];

    let media_capabilities = await handleMediaCapabilities();
    data["Media Capabilities"] = media_capabilities[0];
    data["MediaHash"] = media_capabilities[1];

    let plugins = await handlePlugins();
    data["Plugins"] = plugins[0];
    data["PluginsHash"] = plugins[1];
    
    data["TXT Canvas"] = canvas["txtCanvas"];

    let params = new URLSearchParams(window.location.search);
    let userSelection = params.get('userSelection');

    if ( userSelection ) {
        const selection = document.getElementById('userSelection').value;
        data["Name"] = selection;
    }
    else {
        data["Name"] = noData;
    }
    
    return data;
}

/**
 * This function orchestrates the collection, processing, and transmission of various device and browser attributes for fingerprinting purposes. 
 * It initializes and aggregates data from multiple sources, including canvas elements, audio samples, fonts, media capabilities, and plugins. 
 * Each attribute type is evaluated for its potential contribution to a unique fingerprint. 
 * The collected data, along with calculated hashes, is then logged and sent to a server. 
 * This function demonstrates a comprehensive approach to gathering a wide range of information that can be used to identify or differentiate devices.
 */
async function manage() {
    let data = await collectData();

    const selection = document.getElementById('userSelection').value;
    user = selection;

    address = "http://127.0.0.1:5000/check"

    sendData(data, address).then(displayResults).catch(error => console.error(error));
}

/**
 * This function asynchronously sends data to the server via a POST request. 
 * The data object is converted to JSON format before transmission. 
 * It returns a promise that resolves with the response from the server or rejects with an error in case of network failure or server error.
 * @param {Object} data The data object to be sent to the server
 * @param {String} address URL/IP address of the API endpoint
 */
async function sendData(data, url_address) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();

        xhr.open("POST", url_address, true);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onload = function() {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                resolve(response); // Resolve the promise with the response
            } else {
                console.error("Error from server:", xhr.status, xhr.statusText);
                reject(new Error(xhr.statusText));
            }
        };

        xhr.onerror = function() {
            console.error("Request failed");
            reject(new Error("Network error"));
        };

        xhr.send(JSON.stringify(data));
    });
}

/**
 * This function displays whether the user is a new or returning user based on the results obtained from the backend handling of the user fingerprint. 
 * It creates header and paragraph elements to display the results and appends them to the corresponding HTML div elements.
 * @param {Array<Boolean>} results Array of results of backend handling of user fingerprint
 */
function displayResults(results) {

    let displayArea = document.getElementById("resultsDisplay");
    
    header = 'Result: ' + (results[0]["Success"] ? "Returning user" : "New user");
    header = '<h2>' + header + '</h2>';

    displayArea.innerHTML += header;


    for (let res in results) {

        for ( let k in results[res] ) {
            displayArea.innerHTML += `<strong>${k}</strong>: ${results[res][k]}<br>`;
        }
    }
}

/**
 * This event listener waits for the DOMContentLoaded event,
 * which indicates that the initial HTML document has been completely loaded and parsed, 
 * before calling the manage function to set up the initial state of the application.
 */
document.addEventListener('DOMContentLoaded', function() {
    manage();
});