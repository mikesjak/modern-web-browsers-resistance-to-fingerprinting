/**
 * This function gathers basic information about the user's browser through the navigator object.
 * @returns {Dictionary<String, String>} an object containing the browser's User Agent string and, where available, the User Agent Data
 */
function navigatorAPI() {
    let userData = {
        "User Agent": navigator.userAgent,
        "User Agent Data": navigator.userAgentData,
    };
    return userData;
}

/**
 * Asynchronously retrieves the browser's HTTP Accept headers from a local Flask server.
 * This function sends a GET request to the `/get-accept-headers` endpoint running on 
 * `http://127.0.0.1:5000`.
 * 
 * The server is expected to return a JSON object containing the following headers: 
 *      `Accept`, `Accept-Charset`, `Accept-Encoding`, and `Accept-Language`.
 * If the request is successful, the headers are returned in a dictionary format. 
 * If an error occurs during the fetch operation (e.g. network failure or CORS issue),
 * the function logs the error and returns `null`.
 * 
 * @returns {Promise<Object|null>} A dictionary of Accept-related headers or `null` if the request fails.
 */
async function getAcceptHeaders() {
    try {
      const response = await fetch('http://127.0.0.1:5000/get-accept-headers');
      const data = await response.json();
      
      const headers = {
        "Accept": data.Accept,
        "Accept-Charset": data["Accept-Charset"],
        "Accept-Encoding": data["Accept-Encoding"],
        "Accept-Language": data["Accept-Language"]
      };
      
      return headers;
    } catch (error) {
      console.error("Error fetching accept headers:", error);
      return null;
    }
}

/**
 * This function aims to retrieve the browser's name using the navigator.userAgentData property,
 * which is a modern approach but not supported in all browsers, such as Mozilla Firefox. 
 * If navigator.userAgentData is available, it extracts the browser name from the brands array. 
 * However, if navigator.userAgentData is unavailable (like in Firefox), the function seems to return an undefined variable noData.
 * @returns {String} browser name or noData message
 */
function getBrowserName() {
    return navigator.userAgentData ? navigator.userAgentData["brands"][2]["brand"] : noData;
}

/**
 * Identifies the browser's core and version.
 * The user agent string can be changed or masked by the browser or user settings, so this method of browser detection is not always reliable.
 * This function identifies only Chrome, Safari of Firefox else returns unknow browser core
 * @returns {[String, String]} Array containing the browser core and version
 */
function getBrowserCore() {
    let uAng = navigator.userAgent;
    let coreOffset, verOffset, core, version;

    if ( navigator.userAgentData ) {
        return [navigator.userAgentData["brands"][0]["brand"], navigator.userAgentData["brands"][0]["version"]]
    }

    if ( ( coreOffset = uAng.indexOf("Chrome") ) != -1 || window.chrome ) {
        verOffset = coreOffset + 7;
        core = "Chromium";
    }
    else if ( ( coreOffset = uAng.indexOf("Safari") ) != -1 ) {
        verOffset = coreOffset + 7;
        core = "Safari";
    }
    else if ( ( coreOffset = uAng.indexOf("Firefox") ) != -1 || window.InstallTrigger != undefined ) {
        verOffset = coreOffset + 8;
        core = "Firefox";
    }
    else {
        return ["Unknown browser", "Unknown version"];
    }

    uAng = uAng.substring(verOffset);
    substrs = uAng.split(" ");
    version = substrs[0];

    return [core, version];
}

/**
 * This function asynchronously gathers data about the user's language preferences and time zone. 
 * It populates an object with the browser's primary language (`Language`), 
 * an array of languages preferred by the user (`Languages`), 
 * and the user's current time zone (`Time Zone`). 
 * @returns {Promise<Dictionary<String, any>>} A promise of a dictionary of semi-identifiers
 */
async function userInformation() {
    let data = new Object();

    data["IP"] = await getIpAddress();
    data["Language"] = navigator.language;
    data["Languages"] = navigator.languages;
    data["Time Zone"] = Intl.DateTimeFormat().resolvedOptions().timeZone;


    return data;
}

/**
 * This function checks the availability of the IndexedDB API in the user's browser.
 * @returns {Boolean} true if window.indexedDB exists, indicating that IndexedDB is supported and can be used for client-side storage of significant amounts of structured data.
 */
function getIndexedDB() {
    return window.indexedDB ? true : false;
}

/**
 * This function checks for the availability of the Web SQL Database in the user's browser.
 * @returns {Boolean} true if window.openDatabase is defined
 */
function getOpenDB() {
    return window.openDatabase ? true : false;
}

/**
 * This function attempts to retrieve the browser's storage quota using the Storage API, specifically through navigator.storage.estimate().
 * @returns {Promise<Int>} A promise of storage quota or noData message
 */
async function storageAPI() {
    let data = new Object();
    let st = navigator.storage;
    if ( st == undefined ) {
        data["Available Browser Storage"] = noData;
        return data;
    }
    let q = (await st.estimate()).quota;
    
    if ( q == undefined ) {
        data["Available Browser Storage"] = noData;
    }
    else {
        data["Available Browser Storage"] = '' + Math.round(q / 1000 / 1000 / 1000) + ' GB';
    }

    return data;
}

/**
 * This function counts the properties within the navigator object by iterating over each property and incrementing a counter. 
 * This provides a simple way to quantify how many properties are available in the navigator object for the current browser environment, 
 * which can vary depending on the browser and its version.
 * @returns {Int} Number of properties of navigator object
 */
function getNavigatorProperties() {
    let num = 0;
    for (let key in navigator) {
        num += 1;
    }
    return num;
}

/**
 * This function asynchronously checks a list of browser permissions and returns those that have been granted. 
 * It iterates through the pre-defined permissions list, querying each one using the navigator.permissions.query method, 
 * and filters out any that are not granted or that cause an error during the query.
 * @param {Array<String>} permissionsList pre-defined permissions list supported by Chromium, Webkit and Firefox browsers
 * @returns {Promise<Array<String>>} returns list of granted permissions
 */
async function checkPermissions(permissionsList) {
    let grantedPermissions = await Promise.all(permissionsList.map(async (permission) => {
      try {
        let status = await navigator.permissions.query({ name: permission });
        return status.state === 'granted' ? permission : null;
      } catch (error) {
        return null; // Return null if permission query fails or is not supported
      }
    }));
    return grantedPermissions.filter(Boolean); // Filter out null values
  }

/**
 * This function defines a comprehensive list of permissions to check, 
 * including device sensors, camera, clipboard, geolocation, and more. 
 * It then calls checkPermissions with this list and returns the permissions that have been granted. 
 * This approach helps in understanding which features a web application can reliably use based on user consent.
 * Note: Permissions occuring in the list are all supported by Chromium, Webkit and firefox browsers.
 * @returns {Promise<Array<String>>} A promise of an array of granted permissions
 */
async function getBrowserPermissions() {
    let permissions = ['accelerometer','accessibility-events','ambient-light-sensor','background-sync',
                       'camera','clipboard-read','clipboard-write','geolocation', 'gyroscope','local-fonts',
                       'magnetometer','microphone','midi','notifications','payment-handler',
                       'persistent-storage','push','storage-access','top-level-storage-access','window-management'];
    let permissionsStatus = await checkPermissions(permissions);
    return permissionsStatus;
}

/**
 * This function creates a canvas element to initialize a WebGL context, which is used to access low-level graphics rendering capabilities. 
 * If successful, it queries the WebGL context for debugging information to obtain the vendor and renderer names directly from the graphics driver. 
 * This is particularly useful for diagnostics and ensuring compatibility with various graphics hardware. 
 * @returns {Dictionary<String, String>} two-sized dictionary of WebGL Vendor and Renderer
 */
function getWebGLInfo() {
    let canvas = document.createElement('canvas');
    let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
        return {"Version": noData, "Vendor": noData, "Unmasked Vendor": noData, "Renderer": noData, "Unmasked Renderer": noData, "Shading Langueage Versions": noData};
    }
    let debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if ( debugInfo ) {
        return {
            "Vendor": gl.getExtension(gl.VERSION), 
            "Unmasked Vendor": gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL), 
            "Renderer": gl.getParameter(gl.RENDERER), 
            "Unmasked Renderer": gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL), 
            "Shading Langueage Versions": gl.getParameter(gl.SHADING_LANGUAGE_VERSION)
        };
    }
    else {
        return {"Vendor": gl.getExtension(gl.VERSION), "Unmasked Vendor": noData, "Renderer": gl.getParameter(gl.RENDERER), "Unmasked Renderer": noData, "Shading Langueage Versions": gl.getParameter(gl.SHADING_LANGUAGE_VERSION)};
    }
}
  
/**
 * Colects information about browser via several APIs and pre-defined functions
 * @returns {Promise<Dictionary<String, String>>} Dictionary of browser attributes 
 */
async function browserInformations() {
    data = new Object();

    let [core, version] = getBrowserCore();

    data["Browser name"] = getBrowserName();
    data["Browser core"] = core;
    data["Browser version"] = version;
    data["Build number"] = navigator.productSub ? navigator.productSub : noData;
    data["Navigator properties"] = getNavigatorProperties();
    data["Browser permissions"] = await getBrowserPermissions();
    data["IndexedDB"] = getIndexedDB() ? "Enabled" : "Disabled";
    data["Open database"] = getOpenDB() ? "Enabled" : "Disabled";
    data["Local storage"] = window.localStorage ? "Enabled" : "Disabled";
    data["Session storage"] = window.sessionStorage ? "Enabled" : "Disabled";
    data["Global Storage"] = window.globalStorage ? "Enabled" : "Disabled";
    data["PDF Viewer"] = navigator.pdfViewerEnabled ? "Enabled" : "Disabled";
    data["Cookies Enabled"] = navigator.cookieEnabled ? "True" : "False";
    data["Do not track"] = (navigator.msDoNotTrack || navigator.doNotTrack) ? "True" : (navigator.doNotTrack == null ? "Not supported" : "False");
    data["AdBlock"] = usesAdBlock() ? "True" : "False";
    data["Navigator Vendor"] = navigator.vendor;

    const webGLInfo = getWebGLInfo();
    for ( let k in webGLInfo ){
        data[k] = webGLInfo[k];
    }

    return data;
}