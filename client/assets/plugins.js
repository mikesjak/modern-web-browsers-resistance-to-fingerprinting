/**
 * This function retrieves the number of installed plugins in the browser.
 * If the information is available, it returns the number of installed plugins as a number. 
 * Otherwise, it returns the string "noData" to indicate that the information is not available.
 * @returns {Int} number of installed plugins
 */
function getPluginsInstalled() {
    return navigator.plugins.length ? navigator.plugins.length : noData;
}

/**
 * This function collects information about the plugins used in the browser. 
 * It returns an object containing the names and filenames of each plugin if the information is available. 
 * If the information is unavailable, it returns the string "noData" to indicate that the data is not accessible.
 * @returns {Dictionary<String, String>} A dicrionary of a name and a filename for each plugin
 */
function getInstalledPlugins() { 
    let data = new Object();

    if ( !navigator.plugins ) return noData;

    for (i = 0; i < navigator.plugins.length; i++) {
        data[navigator.plugins[i].name] = navigator.plugins[i].filename;
    }

    return data;
}

/**
 * This function takes an object containing plugin names as keys and filenames as values and displays this information in the designated HTML element. 
 * Each plugin's name is shown in bold, followed by its filename.
 * @param {Dictionary<String, String>} name and filename for each plugin 
 */
function displayPlugins(plugins) {
    let displayArea = document.getElementById("PluginsDisplay");
    displayArea.innerHTML = "<h1>Installed plugins</h1>";

    for (let plugin in plugins) {
        let pluginName = plugin;
        let fileName = plugins[plugin];
        displayArea.innerHTML += `<strong>${pluginName}</strong>  ${fileName}<br>`;
    }
}

/**
 * This function is a wrapper that collects information about installed plugins, displays it using the displayPlugins function, 
 * and then computes the SHA256 hash of the plugin information. 
 * @returns {Promise<String>} A promise that resolves to the SHA256 hash.
 */
async function handlePlugins() {
    let plugins = getInstalledPlugins();
    displayPlugins(plugins);

    //console.log(plugins);

    return [plugins, await sha256(JSON.stringify(plugins, null, 1))];
    //return plugins
}