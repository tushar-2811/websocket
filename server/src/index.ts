import WebSocket, {WebSocketServer} from "ws";
import express , {Request} from 'express'
import { RedisSubscriptionManager } from "./RedisClient";

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

const users : {[key : string] : {
    room : string;
    ws : any
}} = {};

wss.on('connection' , function(ws , req) {
    const wsId = userCount++; // unique id for each websocket connection
    console.log("new connection with websocket id : ", wsId );


    ws.on("message" , (message : string) => {
        const data = JSON.parse(message.toString());

        if(data.type === "join"){
            console.log("inside join" , wsId);
            users[wsId] = {
                room: data.payload.roomId,
                ws  : ws
            };
            RedisSubscriptionManager.getInstance().subscribe(wsId.toString(),data.payload.roomId , ws);


        }

        if(data.type === "message"){
            console.log("inside message", wsId);
            const socketId:string = wsId.toString();
            const roomId = users[socketId].room;
            const message = data.payload.message;

            RedisSubscriptionManager.getInstance().addChatMessage(roomId , wsId.toString() , message);

        //     Object.keys(users).forEach((wsId) => {
        //         if(users[wsId].room === roomId && socketId !== wsId){
        //             users[wsId].ws.send(JSON.stringify({
        //                 type : "message",
        //                 payload : {
        //                     message
        //                 }
        //             }))
        //         }
        //     })
        }
    });

    ws.on("close" , () => {
        console.log(`Connection closed for wsId ${wsId}`);
        if(users[wsId]){
            RedisSubscriptionManager.getInstance().unsubscribe(wsId.toString() , users[wsId].room);
        }
    })

    ws.on("error", (error) => {
        console.log(`Error for wsId ${wsId}:`, error);
    });

})