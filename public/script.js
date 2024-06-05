//In client, can add event listeners for close, error, message events
const socket = new WebSocket (`ws://localhost/`)
socket.onopen  = () => console.log (`client websocket opened!`)
socket.onclose = () => console.log (`client websocket closed!`)
socket.onerror =  e => console.dir (e)

let savedConfessions = []
// let colorIndex = 0;
// const colors = ['#ff6699', '#33ccff', '#ffcc33', '#99ff99']

socket.onmessage = e => { 

    // convert the string back into an object
    const confessionObj = JSON.parse (e.data) 
    if (!confessionObj.text) return 

    // add the object to the array
    savedConfessions.push (confessionObj) 
    displayOnCanvas()
};

document.body.style.margin   = 0
document.body.style.overflow = `hidden`

const canvas = document.getElementById('confessionCanvas')
const ctx = canvas.getContext('2d')
canvas.width = innerWidth
canvas.height = innerHeight

const confessionInput = document.getElementById('confession-input')
// const button = document.getElementById('submit-button')
const form = document.getElementById('form')

form.onsubmit = e => {

    e.preventDefault () 

    const confessionText = confessionInput.value 
    if (!confessionText) return 

    // random color
    const r = Math.floor(Math.random() * 256) 
    const g = Math.floor(Math.random() * 256) 
    const b = Math.floor(Math.random() * 256) 
    
    const confessionObj = { 
        text: confessionText, 
        // return value from 0 to 1 - ratio to fit to different window size
        x_phase: Math.random(), 
        y_phase: Math.random(), 
        color: `rgba(${ r }, ${ g }, ${ b })` 
    } 

    savedConfessions.push(confessionObj) 
    socket.send (JSON.stringify (confessionObj)) 
    displayOnCanvas() 
    confessionInput.value = ''
}

// To display confessions on canvas
function displayOnCanvas() {

    // Clear canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas styles (font, color, etc.)
    ctx.font = "16px Arial";

    savedConfessions.forEach (c => {
        
        //convert ratio to pixels
        const x_pos = c.x_phase * canvas.width
        const y_pos = c.y_phase * canvas.height
        ctx.fillStyle = c.color;
        ctx.fillText(c.text, x_pos, y_pos);
    })
}
