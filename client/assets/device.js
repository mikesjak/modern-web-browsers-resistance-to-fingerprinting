/**
 * This function identifies the operating system (OS) of the user's device by analyzing the browser's user agent data.
 * It first checks the modern navigator.userAgentData.platform for a direct OS indication.
 * Failing that, it falls back to navigator.oscpu or navigator.platform, parsing these strings for known OS identifiers.
 * The function simplifies complex OS identifications into more general categories like "MacOS," "Windows," and "Linux," among others. 
 * This approach ensures broad compatibility and straightforward OS detection.
 * @returns {String} OS
 */
function getOS() {
    let os;

    if ( navigator.userAgentData && navigator.userAgentData["platform"] ) {
        return navigator.userAgentData["platform"];
    }

    if ( navigator.oscpu ) {
        os = navigator.oscpu;
    }
    else if ( navigator.platform ) {
        os = navigator.platform;
    }

    if ( os.includes("Mac") ) os = "MacOS";
    else if ( os.includes("Win") ) os = "Windows";
    else if ( os.includes("Windows NT 5.0") || os.includes("Windows 2000") ) os = "Windows 2000";
    else if ( os.includes("Windows NT 5.1") || os.includes("Windows XP") ) os = "Windows XP";
    else if ( os.includes("Windows NT 5.2") ) os = "Windows Server 2003";
    else if ( os.includes("Windows NT 6.0") ) os = "Windows Vista";
    else if ( os.includes("Windows NT 6.1") || os.includes("Windows 7") ) os = "Windows 7";
    else if ( os.includes("Windows NT 6.3") || os.includes("Windows 8.1") ) os = "Windows 8.1";
    else if ( os.includes("Windows NT 6.2") || os.includes("Windows 8") ) os = "Windows 8";
    else if ( os.includes("Windows NT 10.0") || os.includes("Windows 10") ) os = "Windows 10";
    else if ( os.includes("Windows NT 4.0") ) os = "Windows NT 4.0";
    else if ( os.includes("Windows ME") ) os = "Windows ME";
    else if ( os.includes("Android") ) os = "Android";
    else if ( os.includes("SunOS") ) os = "SunOS";
    else if ( os.includes("Linux") ) os = "Linux";
    else if ( os.includes("iOS") ) os = "iOS";
    else if ( os.includes("QNX") ) os = "QNX";
    else if ( os.includes("BeOS") ) os = "BeOS";
    else if ( os.includes("bot") ) os = "Search bot";

    return os;
}

/**
 * This function utilizes the Battery Status API to gather information about the device's battery status, 
 * including the battery level, charging status, and estimated time to charge or discharge.
 * If the Battery Status API is available, it asynchronously retrieves the battery information, formats it, and includes it in the returned data object. 
 * If the API is not available, it sets the data to indicate the lack of battery information availability.
 * @returns {Promise<Dictionary<String, any>>} A promise of a dictionary of semi-identifiers
 */
async function batteryAPI() {
    let data = new Object();

    if ( 'getBattery' in navigator ) {
        const battery = await navigator.getBattery();
        data["Battery level"] = Math.round(battery.level * 100) + " %";
        data["Is Charging"] = battery.charging;
        if ( data["Is Charging"] == false ) {
            data["Discharging time"] = "" + battery.dischargingTime/60 + " min";
        }
        else {
            data["Charging time"] = "" + battery.chargingTime/60 + " min";
        }
    }
    else {
        data = {"Battery API": noData};
    }

    return data;
}

/**
 * This function retrieves data related to the device's network connection using the Network Information API.
 * It collects details such as the connection type and effective type.
 * Additionally, it checks the online status of the navigator to determine if the device is currently online or offline.
 * @returns {Dictionary<String, any>} connection type and effective type
 */
function connectionAPI() {
    let conn = navigator.connection;
    let data = new Object()

    if ( !conn ){
        data = {"Connection": noData};
    }
    else {
        data["Connection type"] = conn.type ? conn.type : "Not allowed";
        data["Effective type"] = conn.effectiveType ? conn.effectiveType : "Not allowed";
        data["Network status"] = navigator.onLine ? "Online" : "Ofline";
    }

    return data
}

/**
 * This function compiles a comprehensive set of data points related to the device's screen, 
 * including dimensions, usable area, color depth, and touch screen capability. 
 * @returns {Dictionary<String, any>} dictionary of semi-identifiers defined by the device screen
 */
function screenInformation() {
    let data = new Object();

    data["Screen Width"] = screen.width;
    data["Screen Height"] = screen.height;
    data["Usable Screen Width"] = window.screen.availWidth;
    data["Usable Screen Height"] = window.screen.availHeight;
    data["Color Depth"] = window.screen.colorDepth + " bit";
    data["Touch Screen"] = ( 'ontouchstart' in window || navigator.maxTouchPoints ) ? "True" : "False";
    
    return data;
}

/**
 * This function gathers and returns an object containing various details about the user's device. 
 * It includes the operating system (OS), device memory in gigabytes, the number of CPU cores, the OS CPU description if available, and the CPU class. 
 * This function leverages specific navigator properties and the custom getOS function to identify and describe key hardware and software characteristics of the device.
 * @returns {Dictionary<String, any>} A dictionary of collected information about device
 */
function deviceInformation() {
    data = new Object();

    data["OS"] = getOS();
    data["Device Memory"] = "" + navigator.deviceMemory + " GB";
    data["CPU Core Count"] = navigator.hardwareConcurrency;
    data["OS CPU"] = navigator.oscpu ? navigator.oscpu : noData;
    data["CPU Class"] = navigator.cpuClass;

    return data;
}

/**
 * This function asynchronously fetches the user's public IP address from your own server.
 * It sends a request to an endpoint that returns the IP address as JSON.
 * In case of failure, it logs the error and returns 0 as a fallback.
 * 
 * @returns {Promise<string>} IP address
 */
async function getIpAddress() {
    try {
        const response = await fetch('http://127.0.0.1:5000/get-ip');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error fetching IP:', error);
        return '0';
    }
}

