import WebSocket, {WebSocketServer} from "ws";
import express from 'express'

// import http from 'http'

// const server = http.createServer(function(request : any , response : any){
//     console.log(new Date() + 'Recieved request for ' + request.url);
//     response.end("hi there");
// })

const app = express();
const server = app.listen(8080 , () => {
    console.log(new Date() + `Server is listening on port 8080`)
});

const wss = new WebSocketServer({server});
let userCount = 0; 

wss.on('connection' , function(socket) {
    socket.on('error' , (err) => {
        console.error(err);
    })

    socket.on('message' , function message(data , isBinary) {
        wss.clients.forEach(function each(client){
            if(client.readyState === WebSocket.OPEN ){
                client.send(data , {binary : isBinary});
            }
        });
    });
    console.log("user connected" , ++userCount);
    socket.send("Hello ! message from server!!");
})




// server.listen(8080 , function() {
//     console.log(new Date() + "server is listening on port : 8080");
// })