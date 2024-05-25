"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisSubscriptionManager = void 0;
const redis_1 = require("redis");
class RedisSubscriptionManager {
    constructor() {
        this.subscriber = (0, redis_1.createClient)();
        this.publisher = (0, redis_1.createClient)();
        this.publisher.connect();
        this.subscriber.connect();
        this.subscriptions = new Map();
        this.reverseSubscriptions = new Map();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new RedisSubscriptionManager();
        }
        return this.instance;
    }
    subscribe(userId, room, ws) {
        var _a;
        // adding to subscriptions
        this.subscriptions.set(userId, [
            ...(this.subscriptions.get(userId) || []), room
        ]);
        // adding to reverse subscriptions
        this.reverseSubscriptions.set(room, Object.assign(Object.assign({}, (this.reverseSubscriptions.get(room) || {})), { [userId]: { userId: userId, ws } }));
        if (((_a = Object.keys(this.reverseSubscriptions.get(room) || {})) === null || _a === void 0 ? void 0 : _a.length) === 1) {
            console.log(`subscribing message from room : ${room}`);
            this.subscriber.subscribe(room, (payload) => {
                try {
                    const subscribers = this.reverseSubscriptions.get(room) || {};
                    Object.values(subscribers).forEach(({ ws }) => ws.send(payload));
                }
                catch (error) {
                    console.log("error while subscribing", error);
                }
            });
        }
    }
    unsubscribe(userId, room) {
        var _a, _b, _c;
        this.subscriptions.set(userId, ((_a = this.subscriptions.get(userId)) === null || _a === void 0 ? void 0 : _a.filter((x) => x !== room)) || []);
        if (((_b = this.subscriptions.get(userId)) === null || _b === void 0 ? void 0 : _b.length) === 0) {
            this.subscriptions.delete(userId);
        }
        (_c = this.reverseSubscriptions.get(room)) === null || _c === void 0 ? true : delete _c[userId];
        if (!this.reverseSubscriptions.get(room) ||
            Object.keys(this.reverseSubscriptions.get(room) || {}).length === 0) {
            console.log("unSubscribing from " + room);
            this.subscriber.unsubscribe(room);
            this.reverseSubscriptions.delete(room);
        }
    }
    addChatMessage(room, wsId, message) {
        return __awaiter(this, void 0, void 0, function* () {
            this.publish(room, {
                type: "message",
                payload: {
                    message: message,
                    sendBy: wsId
                }
            });
        });
    }
    publish(room, message) {
        console.log(`publishing message to ${room}`);
        this.publisher.publish(room, JSON.stringify(message));
    }
}
exports.RedisSubscriptionManager = RedisSubscriptionManager;
