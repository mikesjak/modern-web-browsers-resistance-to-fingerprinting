/**
 * Click event listener of element with class "toggleButton"
 * Toggles the display of a target div based on its data-target attribute
 */
document.querySelectorAll('.toggleButton').forEach(button => {
    button.addEventListener('click', function() {
        var targetDiv = document.getElementById(this.getAttribute('data-target'));
        targetDiv.style.display = targetDiv.style.display === 'none' ? 'block' : 'none';
    });
});

/**
 * Executed when the document content is fully loaded, 
 * ensures all .toggleButton elements have a uniform width, set to the width of the widest button found among them. 
 * This approach enhances UI 
 */
document.addEventListener('DOMContentLoaded', function() {
    var buttons = document.querySelectorAll('.toggleButton');
    var maxWidth = 0;

    // Find the widest button
    buttons.forEach(function(button) {
        if (button.offsetWidth > maxWidth) {
            maxWidth = button.offsetWidth;
        }
    });

    // Set all buttons to the widest width
    buttons.forEach(function(button) {
        button.style.width = maxWidth + 'px';
    });
});
