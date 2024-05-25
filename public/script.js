//In client, can add event listeners for close, error, message events
const socket = new WebSocket (`wss://localhost/`)
socket.onopen  = () => console.log (`client websocket opened!`)
socket.onclose = () => console.log (`client websocket closed!`)
socket.onerror =  e => console.dir (e)

const squares = []

socket.onmessage = e => {
    console.log (`websocket message received:`)

    // convert the string back into an object
    const pos = JSON.parse (e.data)

    // add the position object to the squares array
    squares.push (pos)

    // display the position object in the console
    console.dir (pos)
}


        const confessions = document.getElementById('confessions');
        let colorIndex = 0;
        const colors = ['#ff6699', '#33ccff', '#ffcc33', '#99ff99'];

        function submitConfession() {
            const confessionText = document.getElementById('confession-input').value;
            if (!confessionText) return;

             // Save confession (example: Local Storage)
             savedConfessions.push(confessionText);
             localStorage.setItem('confessions', JSON.stringify(savedConfessions));   

            const confessionElement = document.createElement('div');
            confessionElement.classList.add('confession');
            confessionElement.textContent = confessionText;
            confessionElement.style.color = colors[colorIndex % colors.length];
            colorIndex++;
            confessions.appendChild(confessionElement);

            document.getElementById('confession-input').value = '';
        }

// Function to display confessions on canvas
function displayOnCanvas() {
    const canvas = document.getElementById('confessionCanvas');
    const ctx = canvas.getContext('2d');

    // Clear canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas styles (font, color, etc.)
    ctx.font = "16px Arial";

    let yPosition = 20;  // Starting position for text
    for (const confession of savedConfessions) {
        ctx.fillStyle = colors[colorIndex % colors.length];
        ctx.fillText(confession, 10, yPosition);
        yPosition += 25;  // Adjust spacing between confessions
        colorIndex++;
    }
}

// Call displayOnCanvas on button click or other event
document.getElementById('show-confessions-btn').addEventListener('click', displayOnCanvas);

// Animation for floating text
const animation = confessionElement.animate([
    { transform: 'translateY(0px)' },
    { transform: 'translateY(-20px)' },
    { transform: 'translateY(0px)' }
], {
    duration: 5000, // Adjust duration as needed (in milliseconds)
    iterations: Infinity,
    easing: 'ease-in-out'
});
          

