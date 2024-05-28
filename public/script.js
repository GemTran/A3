//In client, can add event listeners for close, error, message events
const socket = new WebSocket (`wss://gemtran-a3.deno.dev/`)
socket.onopen  = () => console.log (`client websocket opened!`)
socket.onclose = () => console.log (`client websocket closed!`)
socket.onerror =  e => console.dir (e)

// const squares = []

// socket.onmessage = e => {
//     console.log (`websocket message received:`)

//     // convert the string back into an object
//     const pos = JSON.parse (e.data)

//     // add the position object to the squares array
//     squares.push (pos)

//     // display the position object in the console
//     console.dir (pos)
// }

socket.onmessage = e => {
    const positionData = JSON.parse(e.data);
    // Find the element associated with this position data and update its position
    // This requires a mapping between elements and their identifiers sent to the server
    const elementToUpdate = getElementByIdentifier(positionData.id); // Implement this function
    elementToUpdate.style.transform = `translate(${positionData.x}px, ${positionData.y}px)`;
};

document.body.style.margin   = 0
document.body.style.overflow = `hidden`

// function animateFloatingText(element) {
//     // Generate random positions
//     function getRandomPosition() {
//         const x = Math.random() * window.innerWidth;
//         const y = Math.random() * window.innerHeight;
//         return [x, y];
//     }

//     // Get current position
//     function getCurrentPosition() {
//         const rect = element.getBoundingClientRect();
//         return [rect.left + window.scrollX, rect.top + window.scrollY];
//     }

//     // Animate to a new random position
//     function animateToNewPosition() {
//         const [startX, startY] = getCurrentPosition();
//         const [endX, endY] = getRandomPosition();

//         element.animate([
//             { transform: `translate(${startX}px, ${startY}px)` },
//             { transform: `translate(20px, 20px)` }
//         ], {
//             duration: 5000, // Duration of the animation in milliseconds
//             fill: 'both',
//             easing: 'linear',
//             iterations: 1 // Single iteration for this movement
//         })
//         .finished.then(() => {
//             // Once the animation is complete, call this function again to continue the animation
//             animateToNewPosition();
//         });
//     }

//     // Start the animation loop
//     animateToNewPosition();
// }

const confessions = document.getElementById('confessions');
let savedConfessions =[]
let colorIndex = 0;
const colors = ['#ff6699', '#33ccff', '#ffcc33', '#99ff99'];

const button = document.getElementById('submitButton');

// button.addEventListener('click', submitConfession())

function submitConfession() {
    const confessionText = document.getElementById('confession-input').value;
    if (!confessionText) return;

    // Save confession (example: Local Storage)
    savedConfessions.push(confessionText);
    localStorage.setItem('confessions', JSON.stringify(savedConfessions));  

    // const confessionElement = document.createElement('div');
    // confessionElement.classList.add('confession');
    // confessionElement.textContent = confessionText;
    // confessionElement.style.color = colors[colorIndex % colors.length];
    // colorIndex++;

    // // Append the confession element to the DOM
    // confessions.appendChild(confessionElement);

    // // Start the floating animation
    // animateFloatingText(confessionElement);

// // Create and start the animation for this specific confession element
// const animation = confessionElement.animate([
//     { transform: 'translateY(0px)' }, // Start state
//     { transform: 'translateY(-20px)' }, // Midpoint
//     { transform: 'translateY(0px)' } // End state
// ], {
//     duration: 5000, // Adjust duration as needed (in milliseconds)
//     iterations: Infinity, // Number of times the animation should repeat
//     easing: 'ease-in-out' // Easing function to control the speed curve of the animation
// });

    document.getElementById('confession-input').value = '';
}

// Call displayOnCanvas on button click or other event
//button.addEventListener('click', submitConfession);

const canvas = document.getElementById('confessionCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = innerWidth
    canvas.height = innerHeight

// Function to display confessions on canvas
function displayOnCanvas() {

    // Clear canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas styles (font, color, etc.)
    ctx.font = "16px Arial";
    for (const confession of savedConfessions) {

        // ctx.fillStyle = colors[colorIndex % colors.length];
        // colorIndex++;

        ctx.fillStyle = `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
        ctx.fillText(confession, Math.random() * canvas.width, Math.random() * canvas.height);
        
    }
    
}
// New function to wrap the calls to submitConfession and displayOnCanvas
function handleButtonClick() {
    submitConfession();
    displayOnCanvas();
}
button.addEventListener('click', handleButtonClick);

document.body.onclick = e => {

    // converting the .offset positions
    // to a ratio of the total length
    // between 0 - 1
    const pos = {
        x_phase : e.offsetX / canvas.width,
        y_phase : e.offsetY / canvas.height,
    }

    // turn the pos object into a string
    const pos_string = JSON.stringify (pos)

    // send to the websocket server
    socket.send (pos_string)
}

          

