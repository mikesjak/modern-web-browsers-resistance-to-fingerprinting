
document.addEventListener('DOMContentLoaded', function() {
    // Parse URL parameters
    let params = new URLSearchParams(window.location.search);
    let userSelection = params.get('userSelection');
  
    if (userSelection) {
      const selectionElement = document.getElementById('userSelection');
      selectionElement.value = userSelection;
    }
});

async function storeSelection() {
    let user = ''; 

    let selection = document.getElementById('userSelection').value;
    user = selection;
    
    let data = await collectData();
    data["Name"] = user;
    console.log(data);
    sendData(data, "http://127.0.0.1:5000/save-user")
}
