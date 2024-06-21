//In client, can add event listeners for close, error, message events
const socket = new WebSocket (`wss://howarewe-thutran.deno.dev/`)
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

// To display confessions on canvas
function displayOnCanvas() {

    // Save the current state of the canvas context
    ctx.save();

    // Clear canvas before drawing
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    ctx.font = "20px Miniver";

    savedConfessions.forEach (c => {
        
        //convert ratio to pixels
        const x_pos = c.x_phase * innerWidth
        const y_pos = c.y_phase * innerHeight
        ctx.fillStyle = c.color;
        ctx.fillText(c.text, x_pos, y_pos);
    })

    // Restore the original state
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
        // return value from 0 to 1 - ratio
        x_phase: Math.random(), 
        y_phase: Math.random(), 
        color: `rgba(${ r }, ${ g }, ${ b })` 
    } 

    socket.send (JSON.stringify (confessionObj)) 
    confessionInput.value = ''
}

//------Image Pattern Arrays--------

// Create a temporary canvas to draw img
const tempCanvas = document.createElement('canvas');
tempCanvas.width = canvas.width;
tempCanvas.height = canvas.height; 
const tempCtx = tempCanvas.getContext('2d');

let img = new Image();

// Make image as pattern for drawing shapes
let pattern;
let i = 0;

// Define array of image paths
const imgPaths = [
    "images/Img1.png",
    "images/Img2.JPG",
    "images/Img3.JPG",
    "images/Img4.JPG",
    "images/Img5.png",
    "images/Img6.JPG"
];

img.onload = () => {

    //Resize img to fit canvas height and keep img ratio
    tempCanvas.height = tempCanvas.width * (img.height / img.width);

    //Draw the image on the temporary canvas
    tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);

    // Use the temporary canvas as a pattern
    pattern = ctx.createPattern(tempCanvas, 'repeat');
};

function loadImagePattern () {
    img.src = imgPaths[i];
};

loadImagePattern();

//Change pattern every 5 secs
setInterval(() => {
    i++
    i %= imgPaths.length; // cycle back to 0
    loadImagePattern();
}, 5000);


//---c2 Library QuadTrees Inspired Ren Yuan---------
const c2Canvas = document.getElementById('c2');
const c2Ctx = c2Canvas.getContext('2d');

c2Canvas.width = innerWidth;
c2Canvas.height = innerHeight;

c2Canvas.style.zIndex = -1;
c2Canvas.style.position = 'absolute';
c2Canvas.style.pointerEvents = 'auto';

const renderer = new c2.Renderer(c2Canvas);
resize();

renderer.background('#000000');

let random = new c2.Random();

class Agent extends c2.Circle{
    constructor() {
        let x = random.next(renderer.width);
        let y = random.next(renderer.height);
        let r = random.next(10, renderer.width/12);
        super(x, y, r);

        this.vx = random.next(-2, 2);
        this.vy = random.next(-2, 2);
        this.color = c2.Color.hsl(random.next(0, 50), random.next(20, 60), random.next(20, 100));
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

    const overlayCol = 'rgba(150, 80, 90, 0.7)';
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
});

function resize() {
    let parent = renderer.canvas.parentElement;
    renderer.size(innerWidth, innerHeight);
}

window.addEventListener('resize', resize);

resize();

//--------AUDIO----------

// get and suspend audio context
const audio_context = new AudioContext ();
audio_context.suspend ();

// Define an array of notes 
const notes = [59, 62, 65, 69, 72, 80, 82, 79, 75, 68];

let j = 0;
let running = false;
let period = 200;
let len = 0;

// Function to play a note
function playNote(note, length) {
    // If the audio context is not running, resume it
    if (audio_context.state!= 'running') initAudio();

    // Create an oscillator
    const osc = audio_context.createOscillator();
    
    // Set the oscillator type to sine
    osc.type = 'sine';

    osc.frequency.value = 440 * 2 ** ((note - 69) / 12)

    // Create an amp node
    const amp = audio_context.createGain();
    amp.gain.value = 0.5; // Slightly reverberate the sound

    osc.connect(amp).connect(audio_context.destination);
    // the .currentTime property of the audio context
    // contains a time value in seconds
    const now = audio_context.currentTime
    amp.gain.setValueAtTime (0, now)

    // take 0.02 seconds to go to 0.4, linearly
    amp.gain.linearRampToValueAtTime (0.4, now + 0.02)

    // this method does not like going to all the way to 0
    // so take length seconds to go to 0.0001, exponentially
    amp.gain.exponentialRampToValueAtTime (0.0001, now + length)

    // Start the oscillator
    osc.start(now);

    // Stop the oscillator after the specified length
    osc.stop(now + length);
}

// declaring a function that plays the next note
function nextNote () {
    playNote (notes[j], len)

    // iterate the iterator
    j++;
    j %= notes.length;
}

// this is a recursive function
function notePlayer () {

    // play the next note
    nextNote ();
;
    setTimeout (notePlayer, period);
}

// Initialize the audio context
function initAudio() {
    audio_context.resume();
}
c2Canvas.onpointerenter = e => {

    // set running to true
    running = true

    // initiate the recurseive note_player function
    notePlayer ()
}

// when the cursor moves over the canvas
c2Canvas.onpointermove = e => {

    // as the cursor goes from left to right
    // from 0 to 5
    len = 5 * e.offsetX / c2Canvas.width

    // as the cursor goes from bottom to top
    period = 100 + ((e.offsetY / c2Canvas.height) ** 2) * 400
}

// when the cursor leaves the canvas
c2Canvas.onpointerleave = e => {

    running = false
}

