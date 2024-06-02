// import { openKv } from "@deno/kv";

const kv = await Deno.openKv();
// await kv.init();

// import { createKV } from "https://deno.land/x/kv/mod.ts";

// const kv = createKV("my_kv");
// await kv.init();

serve(handler, { port: 80 })

let sockets = []

function handler (incoming_req) {

    // console.log (incoming_req.headers)

    let req = incoming_req
    const upgrade = req.headers.get ("upgrade") || ""

    // check if it is an upgrade request
    if (upgrade.toLowerCase() == "websocket") {

        const { socket, response } = Deno.upgradeWebSocket (req)

        socket.onopen  = () => {
            console.log (`server WebSocket opened`)

            // add the socket to the sockets array
            sockets.push (socket)
        }

        socket.onclose = () => {
            console.log (`server WebSocket closed`)

            // filters closed sockets (ie. sockets without
            // a .readyState of 1) out of the array
            sockets = sockets.filter (s => s.readyState == 1)
        }

        socket.onerror = e => console.dir (e)

        socket.onmessage = e => {
            console.log (`incoming message: ${ e.data }`)

            // send the message data back out 
            // to each of the sockets in the array
            sockets.forEach (s => s.send (e.data))
        }
        return response
    }
    
if (req.method === "POST" && req.url === "/saveConfession") {
    const { text } =  req.json();
    
    kv.set(`confession:${Date.now()}`, text);
    return new Response(null, { status: 201 }); // Created
}

if (req.method === "GET" && req.url === "/getConfessions") {
    const keys =  kv.keys();
    const confessions = [];
    for (const key of keys) {
        if (key.startsWith("confession:")) {
            const value = async kv.get(key);
            confessions.push({ text: value });
        }
    }
    return new Response(JSON.stringify(confessions), { status: 200 });
}
}