"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const express_1 = __importDefault(require("express"));
const RedisClient_1 = require("./RedisClient");
// import http from 'http'
// const server = http.createServer(function(request : any , response : any){
//     console.log(new Date() + 'Recieved request for ' + request.url);
//     response.end("hi there");
// })
const app = (0, express_1.default)();
const server = app.listen(8080, () => {
    console.log(new Date() + `Server is listening on port 8080`);
});
const wss = new ws_1.WebSocketServer({ server });
let userCount = 0;
const users = {};
wss.on('connection', function (ws, req) {
    const wsId = userCount++; // unique id for each websocket connection
    console.log("new connection with websocket id : ", wsId);
    ws.on("message", (message) => {
        const data = JSON.parse(message.toString());
        if (data.type === "join") {
            console.log("inside join", wsId);
            users[wsId] = {
                room: data.payload.roomId,
                ws: ws
            };
            RedisClient_1.RedisSubscriptionManager.getInstance().subscribe(wsId.toString(), data.payload.roomId, ws);
        }
        if (data.type === "message") {
            console.log("inside message", wsId);
            const socketId = wsId.toString();
            const roomId = users[socketId].room;
            const message = data.payload.message;
            RedisClient_1.RedisSubscriptionManager.getInstance().addChatMessage(roomId, message);
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
    ws.on("close", () => {
        RedisClient_1.RedisSubscriptionManager.getInstance().unsubscribe(wsId.toString(), users[wsId].room);
    });
});
