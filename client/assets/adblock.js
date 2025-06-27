/**
 * This function attempts to detect the presence of an ad blocker 
 * by creating and appending a div element with common ad-related identifiers to the document body. 
 * If the element is removed or hidden by an ad blocker, the function infers that an ad blocker is active. 
 * The function employs a try-catch block to gracefully handle any errors during execution, defaulting to assuming no ad blocker if an error occurs. 
 * Note: This method is a heuristic and may not detect all ad blockers.
 * @returns {Boolean} true if AdBlock is On
 */
function usesAdBlock() {
    let d = document.createElement("div");
    d.setAttribute("class", "adsbox");
    d.setAttribute("id", "ads");

    try {
        document.body.appendChild(ads);
        return document.getElementById("ads") ? false : true;
    }
    catch (err) {
        return false;
    }
}