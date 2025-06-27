/** 
 * This function asynchronously enumerates all available media devices using the navigator.mediaDevices.enumerateDevices() method. 
 * It constructs a dictionary where each key represents a device ID, and the corresponding value is an array containing the device kind and label. 
 * The function returns a promise that resolves to this dictionary. 
 * If the navigator.mediaDevices API is not supported, it returns the value noData.
 * @returns {Promise<String, [String, String]>} A promise of a dicrionary of device ID : {device kind, device label}
 */
async function getMediaCapabilities() {
    if ( navigator.mediaDevices ) {
        const devices = await navigator.mediaDevices.enumerateDevices();

        let deviceDescriptions = new Object();
        for (let i = 0; i < devices.length; i++) {
            let deviceLabel = devices[i].label ? devices[i].label : "No label defined";
            let deviceId = devices[i].deviceId ? devices[i].deviceId : i;
            let deviceKind = devices[i].kind ? devices[i].kind : "No kind defined";
            
            deviceDescriptions[deviceId] = [deviceKind, deviceLabel];
        }

        return deviceDescriptions;
    }
    return noData;
}

/**
 * This function a dictionary of device IDs mapped to their respective device kinds and labels. 
 * It displays this information in the HTML element with the ID "MediaCapabilitiesDisplay".
 * @param {Dictionary<String, [String, String]>} devices a Dictionary of device ID : device kind, device label devices 
 * @param {String} divID An identifier of a div to display the media capabilities 
 * 
 */
function displayMediaCapabilities(devices, divID) {
    let displayArea = document.getElementById(divID);
    displayArea.innerHTML = "<h1>Media Capabilities</h1>";

    for (let device in devices) {
        let deviceKind = devices[device][0];
        let deviceLabel = devices[device][1];
        displayArea.innerHTML += `<strong>ID:</strong> ${device} <strong>Label:</strong> ${deviceLabel} <strong>Kind:</strong> ${deviceKind}<br>`;
    }
}

/**
 * This function serves as a wrapper to retrieve information about all available media devices, 
 * display them, and calculate the SHA256 hash of the device information. 
 * The getMediaCapabilities function is called to obtain the media device information, 
 * and the displayMediaCapabilities function is called to display the information in the specified HTML element. 
 * Finally, the SHA256 hash is calculated for the device information and returned.
 * @returns {Promise<String>} A promise that resolves with the SHA256 hash.
 */
async function handleMediaCapabilities() {
    let devices = await getMediaCapabilities();
    displayMediaCapabilities(devices, "MediaCapabilitiesDisplay");

    let media_str = "";
    for ( let device in devices ) {
        media_str += device;
        media_str += devices[device][0];
        media_str += devices[device][1];
        media_str += ';';
    }

    return [devices, await sha256(media_str)];
}