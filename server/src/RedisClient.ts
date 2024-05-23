import { RedisClientType, createClient } from "redis";

export class RedisSubscriptionManager {
    private static instance: RedisSubscriptionManager;
    private subscriber: RedisClientType;
    private publisher: RedisClientType;
    private subscriptions: Map<string , string[]>;
    private reverseSubscriptions: Map<string , { [userId: string] : {userId : string , ws: any}}>

    private constructor() {
        this.subscriber = createClient();
        this.publisher = createClient();

        this.publisher.connect();
        this.subscriber.connect();

        this.subscriptions = new Map<string , string[]>();
        this.reverseSubscriptions = new Map<string , {[userId : string]: {userId : string , ws: any}}>();
    }

    static getInstance() {
        if(!this.instance){
            this.instance = new RedisSubscriptionManager();
        }

        return this.instance;
    }

    subscribe(userId: string , room: string , ws: any) {
        // adding to subscriptions
        this.subscriptions.set(userId , [
            ...(this.subscriptions.get(userId) || []),room
        ]);

        // adding to reverse subscriptions
        this.reverseSubscriptions.set(room , {
            ...(this.reverseSubscriptions.get(room) || {}),
            [userId] : {userId : userId , ws}
        });

        if(Object.keys(this.reverseSubscriptions.get(room) || {})?.length === 1) {
            console.log(`subscribing message from room : ${room}`);

            this.subscriber.subscribe(room , (payload) => {
                try {
                    const subscribers = this.reverseSubscriptions.get(room) || {};
                    Object.values(subscribers).forEach(({ws}) => 
                          ws.send(payload)
                    );
                } catch (error) {
                    console.log("error while subscribing" , error);
                }
            })
        }
    }

    unsubscribe(userId : string , room : string) {
       this.subscriptions.set(
        userId,
        this.subscriptions.get(userId)?.filter((x) => x!==room) || []
       );

       if(this.subscriptions.get(userId)?.length === 0){
         this.subscriptions.delete(userId);
       }

       delete this.reverseSubscriptions.get(room)?.[userId];

       if(!this.reverseSubscriptions.get(room) || 
          Object.keys(this.reverseSubscriptions.get(room) || {}).length === 0
       ) {
        console.log("unSubscribing from " + room);
        this.subscriber.unsubscribe(room);
        this.reverseSubscriptions.delete(room);
       }
    }

    async addChatMessage(room: string , message: string) {
        this.publish(room , {
            type : "message",
            payload : {
                message
            }
        })
    }

    publish(room: string , message: any){
        console.log(`publishing message to ${room}`);
        this.publisher.publish(room , JSON.stringify(message));
    }
}