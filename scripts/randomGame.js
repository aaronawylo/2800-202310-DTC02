
// Define the desired sequence
const desiredSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

// Variable to store the entered sequence
let enteredSequence = [];

// Function to handle keydown event
function handleKeyDown(event) {
    const { key } = event;

    // Add the entered key to the sequence
    enteredSequence.push(key);
    console.log(enteredSequence);
    // Check if the sequence is equal to the desired sequence
    if (enteredSequence.join('') === desiredSequence.join('')) {
        console.log('Sequence matched!');
        // Perform desired action here
        window.location.href = '/easterEgg';
        // if enteredSequence is less than length of desiredSequence, check if the enteredSequence is equal to the same length slice of desiredSequence
    } else if (desiredSequence.length > enteredSequence.length) {
        if (enteredSequence.join('') === desiredSequence.slice(0, enteredSequence.length).join('')) {
            return;
        } else {
            console.log('Sequence not matched!');
            // Clear the entered sequence for a new attempt
            enteredSequence = [];
        }
    } else {
        console.log('Sequence not matched!');
        // Clear the entered sequence for a new attempt
        enteredSequence = [];
    }
}

// Add event listener for keydown event
document.addEventListener('keydown', handleKeyDown);
