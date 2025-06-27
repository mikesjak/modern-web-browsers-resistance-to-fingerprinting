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