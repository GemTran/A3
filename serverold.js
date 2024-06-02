
//In server
// import { serve } from "https://deno.land/std@0.157.0/http/server.ts"
// import { serveDir } from "https://deno.land/std@0.157.0/http/file_server.ts"

// import { getNetworkAddr } from "https://deno.land/x/local_ip/mod.ts" 

// const local_ip = await getNetworkAddr()
// console.log (`local area network IP: ${ local_ip }`)

serve (handler, { port: 80 })

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

    // if the requested url does not specify a filename
    if (req.url.endsWith (`/`)) {

        // add 'index.html' to the url
        req = new Request (`${ req.url }index.html`, req)
    }

    const options = {

        // route requests to this
        // directory in the file system
        fsRoot: `public`
    }

    return serveDir (req, options)
}

