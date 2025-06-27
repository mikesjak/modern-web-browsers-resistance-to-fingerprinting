/**
 * This function efficiently computes the SHA-256 hash of a given string. 
 * It employs the Web Cryptography API to encode the input string as UTF-8, 
 * processes this encoded data through the SHA-256 hashing algorithm, 
 * and then converts the resulting hash buffer into a hexadecimal string. 
 * This function is pivotal for generating secure, unique identifiers or checksums for data validation and integrity checks in web applications.
 * @param {String} str data to hash
 * @returns {Promise<String>} A promise of a SHA256 hash
 */
async function sha256(str) {
    return CryptoJS.SHA256(str).toString(CryptoJS.enc.Hex);

    let encoder = new TextEncoder();
    let data = encoder.encode(str);

    // Hash the data with SHA-256
    let hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert the buffer to a hex string
    let hashArray = Array.from(new Uint8Array(hashBuffer));
    let hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
}

/**
 * This funcion function calculates the hash of a subset of audio samples by summing a specific range
 * and then applying the SHA256 hashing algorithm to the sum. 
 * This process generates both a simple sum hash and a cryptographic SHA256 hash, returning them as a tuple. 
 * This method is particularly useful for creating a unique identifier for a segment of audio data.
 * @param {AudioBuffer} samples audio samples
 * @returns {Promise<String, String>} hash value and SHA256 hash value
 */
async function audioHash(samples) {
    let hash = 0;
    for ( let i = 3000; i < 3500; i++ ) {
    
        hash += Math.abs(samples[i]);
    }

    let shaHash = await sha256(hash.toString());
    return [hash, shaHash];
}