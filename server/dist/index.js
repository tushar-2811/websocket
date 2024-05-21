"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const express_1 = __importDefault(require("express"));
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
    console.log("new connection", ws);
    const wsId = userCount++; // unique id for each websocket connection
    ws.on("message", (message) => {
        const data = JSON.parse(message.toString());
        console.log(data);
        if (data.type === "join") {
            users[wsId] = {
                room: data.payload.roomId,
                ws: ws
            };
        }
        if (data.type === "message") {
            console.log(users[wsId]);
            const roomId = users[wsId].room;
            const message = data.payload.message;
            Object.keys(users).forEach((wsId) => {
                if (users[wsId].room === roomId) {
                    users[wsId].ws.send(JSON.stringify({
                        type: "message",
                        payload: {
                            message
                        }
                    }));
                }
            });
        }
    });
});
