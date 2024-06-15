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

document.body.style.margin   = 0
document.body.style.overflow = `hidden`


const canvas = document.getElementById('confessionCanvas')
const ctx = canvas.getContext('2d')
canvas.width = innerWidth
canvas.height = innerHeight

canvas.style.zIndex = 1
canvas.style.position = 'absolute'
canvas.style.backgroundColor = 'transparent'

const confessionInput = document.getElementById('confession-input')
const form = document.getElementById('form')

const renderer = new c2.Renderer(canvas);
resize();

renderer.background('#cccccc');
let random = new c2.Random();

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
    renderer.stroke('#333333');
    renderer.lineWidth(1);
    renderer.fill(false);
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
    renderer.fill(false);
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


window.addEventListener('resize', resize);
function resize() {
    let parent = renderer.canvas.parentElement;
    renderer.size(parent.clientWidth, parent.clientWidth / 16 * 9);
}

//-----------------------

// To display confessions on canvas
function displayOnCanvas() {

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

// let mouseX = 0 
// let mouseY = 0
// let i = 0

// // Event listener for playNote initialising when mouse move
// confessionCanvas.addEventListener('mousemove', (event) => {
//     mouseX = event.clientX - canvas.getBoundingClientRect().left;
//     mouseY = event.clientY - canvas.getBoundingClientRect().top;
//     // ctx.beginPath();
//     // ctx.arc(mouseX - 10, mouseY - 10, 20, 0, 2 * Math.PI);   
//     // ctx.fill()
//     // ctx.fillStyle = `rgba(200, 200, 200, 0.2)`;  
//     drawShape (mouseX, mouseY)
    
    
// });
// // arc(x, y, radius, startAngle, endAngle)
// function drawShape (x,y) {
//     i+=0.1
//     const startAngle = 0
//     const endAngle = 2 * Math.PI
//     ctx.beginPath();
//     ctx.arc(x, y, 50, startAngle, endAngle);   
//     ctx.fill()
//     ctx.fillStyle = `rgba(200, 200, 200, 0.2)`;   
    
// }

// get and suspend audio context
const audio_context = new AudioContext ()
audio_context.suspend ()

// Define an array of notes 
// ["A5", "B5", "C5", "D5", "E5", "F5"];

// Convert notes to frequency
const notes = [880, 987.77, 523.25, 587.33, 659.26, 698.46]

// Function to play a note
function playNote(note) {
    // If the audio context is not running, resume it
    if (audio_context.state!= 'running') initAudio();

    // Create an oscillator
    const osc = audio_context.createOscillator();

    // Set the oscillator type to sine
    osc.type = 'sine';

    // Set the frequency of the oscillator
    osc.frequency.value = note;

    // Create an amp node
    const amp = audio_context.createGain();
    amp.gain.value = 0.5; // Adjust the volume as needed

    // Connect the oscillator to the amp and then to the audio output
    osc.connect(amp).connect(audio_context.destination);

    // Start the oscillator
    osc.start(audio_context.currentTime);

    // // Stop the oscillator after the specified length
    // osc.stop(audio_context.currentTime + length);
}

// Initialize the audio context
function initAudio() {
    audio_context.resume();
}

confessionCanvas.addEventListener("mousedown", e => {
    playNote(notes[0])
})

//---------c2-library---------------------

//Created by Ren Yuan

// const c2Bg = document.getElementById('c2');
// const renderer = new c2.Renderer(c2Bg);
// resize();

// renderer.background('#cccccc');
// let random = new c2.Random();

// class Agent extends c2.Circle{
//     constructor() {
//         let x = random.next(renderer.width);
//         let y = random.next(renderer.height);
//         let r = random.next(10, renderer.width/15);
//         super(x, y, r);

//         this.vx = random.next(-2, 2);
//         this.vy = random.next(-2, 2);
//         this.color = c2.Color.hsl(random.next(0, 30), random.next(30, 60), random.next(20, 100));
//     }

//     update(){
//         this.p.x += this.vx;
//         this.p.y += this.vy;

//         if (this.p.x < this.r) {
//             this.p.x = this.r;
//             this.vx *= -1;
//         } else if (this.p.x > renderer.width-this.r) {
//             this.p.x = renderer.width-this.r;
//             this.vx *= -1;
//         }
//         if (this.p.y < this.r) {
//             this.p.y = this.r;
//             this.vy *= -1;
//         } else if (this.p.y > renderer.height-this.r) {
//             this.p.y = renderer.height-this.r;
//             this.vy *= -1;
//         }
//     }

//     display(){
//         renderer.stroke(false);
//         renderer.fill(this.color);
//         renderer.circle(this);
//     }

//     bounds(){
//       return this;
//     }
// }

// let agents = [];
// for (let i = 0; i < 25; i++) agents[i] = new Agent();


// let quadTree = new c2.QuadTree(new c2.Rect(0,0,renderer.width,renderer.height), 1);

// function drawQuadTree(quadTree){
//     renderer.stroke('#333333');
//     renderer.lineWidth(1);
//     renderer.fill(false);
//     renderer.rect(quadTree.bounds);

//     if(quadTree.leaf()) return;
//     for(let i=0; i<4; i++) drawQuadTree(quadTree.children[i]);
// }

// let circle = new c2.Circle(0, 0, renderer.width/10);


// renderer.draw(() => {
//     renderer.clear();

//     quadTree.clear();
//     quadTree.insert(agents);

//     drawQuadTree(quadTree);


//     for (let i = 0; i < agents.length; i++) {
//         agents[i].update();
//         agents[i].display();
//     }


//     let mouse = new c2.Point(renderer.mouse.x, renderer.mouse.y);
//     circle.p = mouse;

//     renderer.stroke('#000000');
//     renderer.lineWidth(1);
//     renderer.lineDash([5, 5]);
//     renderer.fill(false);
//     renderer.circle(circle);
//     renderer.lineDash(false);

//     let objects = quadTree.query(circle);

//     for(let i=0; i<objects.length; i++){
//         renderer.stroke('#000000');
//         renderer.lineWidth(1);
//         renderer.fill(false);
//         renderer.circle(objects[i]);
//     }
// });


// window.addEventListener('resize', resize);
// function resize() {
//     let parent = renderer.canvas.parentElement;
//     renderer.size(parent.clientWidth, parent.clientWidth / 16 * 9);
// }

// //-----------------------