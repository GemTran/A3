// In server
import { serve } from "https://deno.land/std@0.157.0/http/server.ts"
import { serveDir } from "https://deno.land/std@0.157.0/http/file_server.ts"

import { getNetworkAddr } from "https://deno.land/x/local_ip/mod.ts" 

const local_ip = await getNetworkAddr()
console.log (`local area network IP: ${ local_ip }`) 

// websocket - always listen
serve (handler, { port: 80 })

// import kv database
const kv = await Deno.openKv();

let sockets = []

function handler (incoming_req) {

    // console.log (incoming_req.headers)
    let req = incoming_req

    //backend check headers - json - if there is update
    const upgrade = req.headers.get ("upgrade") || ""

    // check if it is an upgrade request, connect with websocket
    if (upgrade.toLowerCase() == "websocket") {

        const { socket, response } = Deno.upgradeWebSocket (req)

        socket.onopen  = () => {
            console.log (`server WebSocket opened`)

            // add, save the socket to the sockets array
            sockets.push (socket)
        }

        socket.onclose = () => {
            console.log (`server WebSocket closed`)

            // filters closed sockets (ie. sockets without
            // a .readyState of 1) out of the array
            sockets = sockets.filter (s => s.readyState == 1)
        }

        socket.onerror = e => console.dir (e)

        socket.onmessage = async e => {

            console.log (`incoming message: ${ e.data }`)
            let currentData = [];
            currentData = await kv.get(["confession"]);
            newData = [...currentData, e.data];
            
            await kv.set(["confession"], newData);
            // send the message data back out 
            // to each of the sockets in the array
            sockets.forEach (s => s.send (newData));
        }
    }
    // if the requested url does not specify a filename
    if (req.url.endsWith (`/`)) {

        // add 'index.html' to the url
        req = new Request (`${ req.url }index.html`, req)
    }

    // serve directory
    const options = {

        // route requests to this
        // directory in the file system
        fsRoot: `public`
    }
    return serveDir (req, options)

}

