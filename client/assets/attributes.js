/**
 * This function asynchronously aggregates a comprehensive set of data 
 * from various sources about the user's device and environment. 
 * It utilizes several API calls to gather information such as 
 * user details, device capabilities, network status, and storage information. 
 * Each piece of data is stored as a key-value pair within an object, 
 * which is then returned as a "dictionary" of semi-identifiers. 
 * This organized collection of data is crucial for this applications requiring detailed context about the client's device and settings.
 * @returns {Promise<String, any>} dictionary of all collected semi-identifiers
 */
async function collectAttributes() {
    let data = new Object();
    data["UserAgent"] = navigatorAPI();
    data["Accept Headers"] = await getAcceptHeaders();
    data["User"] = await userInformation();
    data["Battery"] = await batteryAPI();
    data["Connection"] = connectionAPI();
    data["Device"] = deviceInformation();
    data["Screen"] = screenInformation();
    data["Browser"] = await browserInformations();
    data["Storage"] = await storageAPI();
   
    return data;
}

/**
 * This function dynamically presents collected data within a webpage, 
 * organizing it by categories represented as keys in the provided userData object. 
 * Each category is displayed with a header, and its associated data is listed underneath. 
 * If any data value is an object, it is converted to a formatted JSON string for readability. 
 * This approach ensures that complex data structures are presented in a human-readable form.
 * @param {Dictionary<String, any>} userData dictionary of data to be displayed
 */
function displayData(userData) {

    let displayArea = document.getElementById("userDataDisplay");

    for (let key in userData) {
        let data = userData[key];
        displayArea.innerHTML += `<h2>${key}</h2>`;
        
        for ( let k in data ){
            var value = data[k];
            if (typeof value === 'object' && value !== null) {
                value = JSON.stringify(value, null, 2);
            }
            displayArea.innerHTML += `<strong>${k}</strong>: ${value}<br>`;
        }
    }
}

/**
 * Extracts a subset of relevant client attributes from the full dataset and computes a hash for identification.
 * 
 * This function filters and compiles key semi-identifying information from user, device, screen, 
 * and browser metadata. It excludes less relevant browser fields like version and build number.
 * The extracted values are concatenated into a single string, which is then hashed using SHA-256 
 * to generate a fingerprint-like identifier.
 *
 * @param {Object} data - The full attribute set collected from various fingerprinting sources.
 * @returns {Promise<[Object, string]>} A tuple where the first item is a dictionary of selected attributes, 
 *                                      the second is a SHA-256 hash of their concatenated values.
 */

async function getUsefulData(data) {
    let usefulData = new Object();

    usefulData["IP"] = data["User"]["IP"];

    usefulData["CPU"] = data["Device"]["CPU Core Count"];
    usefulData["Memory"] = data["Device"]["Device Memory"];

    for ( let val in data["Screen"] ) {
        usefulData[val] = data["Screen"][val];
    }

    for ( let val in data["Browser"] ) {
        if ( val != "Browser version" && val != "Build number" ){
            usefulData[val] = data["Browser"][val];
        }
    }

    attr_str = ""
    for ( let val in usefulData ){
        attr_str += usefulData[val]
    }   

    return [usefulData, await sha256(attr_str)]
}

/**
 * This function orchestrates a sequence of operations to collect, display, and further process attributes from various APIs. 
 * It first gathers a comprehensive set of attributes through collectAttributes, then displays this data using displayData. 
 * Following the display, it refines the collected data with getUsefulData, extracting and hashing significant pieces of information. 
 * The function ultimately returns this processed data, effectively summarizing the client's environment in a structured and secure format.
 * @returns {Promise<String, any>} dictionary of useful semi-identifiers
 */
async function dataInit() {
    let data = await collectAttributes();
    displayData(data);

    data = await getUsefulData(data);
    
    return data;
}
