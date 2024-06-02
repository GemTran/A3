//In client, can add event listeners for close, error, message events
const socket = new WebSocket (`wss://localhost/`)
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
    const positionData = JSON.parse(e.data)
    // Find the element associated with this position data and update its position
    // This requires a mapping between elements and their identifiers sent to the server
    const elementToUpdate = getElementByIdentifier(positionData.id) // Implement this function
    elementToUpdate.style.transform = `translate(${positionData.x}px, ${positionData.y}px)`
};

document.body.style.margin   = 0
document.body.style.overflow = `hidden`

const canvas = document.getElementById('confessionCanvas')
const ctx = canvas.getContext('2d')
canvas.width = innerWidth
canvas.height = innerHeight

// const confession-container = document.getElementById('confession-container') //div
const confessionInput = document.getElementById('confession-input')
const button = document.getElementById('submit-button')
const form = document.getElementById('form')

let savedConfessions =[]
let colorIndex = 0;
const colors = ['#ff6699', '#33ccff', '#ffcc33', '#99ff99']

// button.addEventListener('click', submitConfession())

form.addEventListener("submit", e => {
    e.preventDefault()
    const confessionText = confessionInput.value

    if (!confessionText) return
    displayOnCanvas(confessionText)

    confessionInput.value = ''

    // Save confession to storage
    savedConfessions.push(confessionText)
    
    // localStorage.setItem('confession-container', JSON.stringify(savedconfession-container));  
})

// button.addEventListener('click', () => {
//     const confessionText = confessionInput.value
// })

// To display confessions on canvas
function displayOnCanvas(confessionText) {
    // const div = document.createElement('div');
    // // div.classList.add('confession');
    // div.textContent = confessionText;
    // // Append the confession element to the DOM
    // document.getElementById("confession-container").appendChild(div);
    // div.style.color = colors[colorIndex % colors.length];
    // colorIndex++;

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

          

