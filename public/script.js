//In client, can add event listeners for close, error, message events
const socket = new WebSocket (`ws://localhost/`)
socket.onopen  = () => console.log (`client websocket opened!`)
socket.onclose = () => console.log (`client websocket closed!`)
socket.onerror =  e => console.dir (e)

document.body.style.margin   = 0
document.body.style.overflow = `hidden`

let savedConfessions = []

socket.onmessage = e => { 

    console.dir (e)
    // convert the string back into an object
    const confessionArray = JSON.parse (e.data) 

    console.dir (confessionArray)

    // add the object to the array
    // savedConfessions.push (confessionArray) 
    savedConfessions = confessionArray
    displayOnCanvas()
};


const canvas = document.getElementById('confessionCanvas')
const ctx = canvas.getContext('2d')
canvas.width = innerWidth
canvas.height = innerHeight


canvas.style.zIndex = 1
canvas.style.position = 'absolute'
canvas.style.backgroundColor = 'transparent'
canvas.style.pointerEvents = 'none'

const confessionInput = document.getElementById('confession-input')
const form = document.getElementById('form')

// To display confessions on canvas
function displayOnCanvas() {
    // Save the current state of the canvas context
    ctx.save();
    // Clear canvas before drawing
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    // Set canvas styles (font, color, etc.)
    ctx.font = "16px Arial";


    savedConfessions.forEach (c => {
        
        //convert ratio to pixels
        const x_pos = c.x_phase * innerWidth
        const y_pos = c.y_phase * innerHeight
        ctx.fillStyle = c.color;
        ctx.fillText(c.text, x_pos, y_pos);
    })

    // Restore the original state to prevent interference with c2 library rendering
    ctx.restore();
}

form.onsubmit = e => {

    e.preventDefault () 

    const confessionText = confessionInput.value 
    if (!confessionText) return 

    // random color
    const r = Math.floor(Math.random() * 256) 
    const g = Math.floor(Math.random() * 256) 
    const b = Math.floor(Math.random() * 256) 
    
    // create a confession object to contain text, position, color 
    const confessionObj = { 
        text: confessionText, 
        // return value from 0 to 1 - ratio to fit to different window size
        x_phase: Math.random(), 
        y_phase: Math.random(), 
        color: `rgba(${ r }, ${ g }, ${ b })` 
    } 

    // savedConfessions.push(confessionObj) 
    // displayOnCanvas()
    socket.send (JSON.stringify (confessionObj)) 
    confessionInput.value = ''
}

//----------c2----------
const c2Canvas = document.getElementById('c2');
const c2Ctx = c2Canvas.getContext('2d')
// Set sizes
c2Canvas.width = innerWidth;
c2Canvas.height = innerHeight;

const renderer = new c2.Renderer(c2Canvas);
resize();

renderer.background('#cccccc');

let random = new c2.Random();

//---Image Pattern Arrays---
let img = new Image();
// image.src = "images/Img1.png"; //Add image path

// Define array of image paths
const imgPaths = [
    "images/Img1.png",
    "images/Img2.JPG",
    "images/Img3.JPG",
    "images/Img4.png",
    "images/Img5.JPG",
    "images/Img6.JPG",
]
// Declare variable to make image as pattern for drawing shapes
let pattern;
img.onload = () => {
    pattern = renderer.context.createPattern(img,"repeat");
};

let i = 0
function loadImagePattern () {
    img.src = imgPaths[i];
}

loadImagePattern();

//Change pattern every 5 secs
setInterval(() => {
    i++ % imgPaths.length; //Loop through array
    loadImagePattern();
}, 8000);

class Agent extends c2.Circle{
    constructor() {
        let x = random.next(renderer.width);
        let y = random.next(renderer.height);
        let r = random.next(10, renderer.width/15);
        super(x, y, r);

        this.vx = random.next(-2, 2);
        this.vy = random.next(-2, 2);
        this.color = c2.Color.hsl(random.next(0, 30), random.next(30, 60), random.next(20, 100));
    }

    update(){
        this.p.x += this.vx;
        this.p.y += this.vy;

        if (this.p.x < this.r) {
            this.p.x = this.r;
            this.vx *= -1;
        } else if (this.p.x > renderer.width-this.r) {
            this.p.x = renderer.width-this.r;
            this.vx *= -1;
        }
        if (this.p.y < this.r) {
            this.p.y = this.r;
            this.vy *= -1;
        } else if (this.p.y > renderer.height-this.r) {
            this.p.y = renderer.height-this.r;
            this.vy *= -1;
        }
    }

    display(){
        renderer.stroke(false);
        renderer.fill(this.color);
        renderer.circle(this);
    }

    bounds(){
      return this;
    }
}

let agents = [];
for (let i = 0; i < 25; i++) agents[i] = new Agent();


let quadTree = new c2.QuadTree(new c2.Rect(0,0,renderer.width,renderer.height), 1);

function drawQuadTree(quadTree){
    renderer.stroke('#dddddd');
    renderer.lineWidth(1);
    renderer.fill(pattern);
    renderer.rect(quadTree.bounds);

    const overlayCol = 'rgba(220, 120, 120, 0.8)';
    renderer.fill(overlayCol);
    renderer.rect(quadTree.bounds);

    if(quadTree.leaf()) return;
    for(let i=0; i<4; i++) drawQuadTree(quadTree.children[i]);
}

let circle = new c2.Circle(0, 0, renderer.width/10);


renderer.draw(() => {
    renderer.clear();

    quadTree.clear();
    quadTree.insert(agents);

    drawQuadTree(quadTree);


    for (let i = 0; i < agents.length; i++) {
        agents[i].update();
        agents[i].display();
    }


    let mouse = new c2.Point(renderer.mouse.x, renderer.mouse.y);
    circle.p = mouse;

    renderer.stroke('#000000');
    renderer.lineWidth(1);
    renderer.lineDash([5, 5]);
    renderer.fill(pattern);
    renderer.circle(circle);
    renderer.lineDash(false);

    let objects = quadTree.query(circle);

    for(let i=0; i<objects.length; i++){
        renderer.stroke('#000000');
        renderer.lineWidth(1);
        renderer.fill(false);
        renderer.circle(objects[i]);
    }

    // Call displayOnCanvas at the end of the c2 draw loop
    // displayOnCanvas();
});


window.addEventListener('resize', resize);
function resize() {
    let parent = renderer.canvas.parentElement;
    renderer.size(innerWidth, innerHeight);
}

//-----------------------

//--------AUDIO----------

// get and suspend audio context
const audio_context = new AudioContext ()
audio_context.suspend ()

// Define an array of notes 
// ["A5" 880, "B5", "C5", "D5", "E5", "F5"];

// Convert notes to frequency
// const notes = [62, 987.77, 523.25, 587.33, 659.26, 698.46]
const notes = [58, 65, 69, 72, 80, 82]
// Function to play a note
function playNote(note, length) {
    // If the audio context is not running, resume it
    if (audio_context.state!= 'running') initAudio();

    // Create an oscillator
    const osc = audio_context.createOscillator();

    // Set the oscillator type to sine
    osc.type = 'triangle';

    // Set the frequency of the oscillator
    // osc.frequency.value = note;
    // set the value using the equation 
    // for midi note to Hz
    osc.frequency.value = 440 * 2 ** ((note - 69) / 12)

    // Create an amp node
    const amp = audio_context.createGain();
    amp.gain.value = 0.6; // Slightly reverberate the sound
    // the .currentTime property of the audio context
    // contains a time value in seconds
    const now = audio_context.currentTime

    // Connect the oscillator to the amp and then to the audio output
    osc.connect(amp).connect(audio_context.destination);

    // Start the oscillator
    osc.start(audio_context.currentTime);

    // Stop the oscillator after the specified length
    osc.stop(audio_context.currentTime + length);
}

// Initialize the audio context
function initAudio() {
    audio_context.resume();
}

// // Event listener for playNote initialising when mouse move
c2Canvas.addEventListener("mousemove", e => {
    playNote(notes[0],1)
})

//-----------------------
