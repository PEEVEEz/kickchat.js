const EventEmitter = require('events');
const WebSocket = require('ws');

const Events = {
    "App\\Events\\ChatMessageSentEvent": "messageSend",
    "App\\Events\\ChatMessageDeletedEvent": "messageDelete"
}

module.exports = class KickChat {
    /**
     * 
     * @param {string} username 
     */
    constructor(username) {
        fetch("https://kick.com/api/v1/channels/" + username).then((res) => res.json().catch(() => null)).then((user) => {
            if (user) {
                this.ws = new WebSocket('wss://ws-us2.pusher.com/app/eb1d5f283081a78b932c?protocol=7&client=js&version=7.4.0&flash=false');

                this.ws.on("open", () => {
                    this.ws.send(JSON.stringify({ event: "pusher:subscribe", data: { auth: "", channel: "chatrooms." + user.chatroom.id } }));
                })

                this.ws.on("message", (data) => {
                    const dataJson = JSON.parse(data.toString()) || null;
                    if (dataJson && dataJson.event && Events[dataJson.event]) {
                        this.eventEmiter.emit(Events[dataJson.event], JSON.parse(dataJson.data))
                    }
                })
            }
            else {
                throw Error("Invalid user")
            }
        })

        this.eventEmiter = new EventEmitter()
    }

    /**
     * 
     * @param {"messageSend" | "messageDelete"} eventName 
     * @param {(data : any) => Promise<void>} listener 
     */
    on(eventName, listener) {
        this.eventEmiter.on(eventName, listener);
    }
}

const kickChat = new KickChat("peevee")
const kickChat2 = new KickChat("buddha")

kickChat2.on("messageSend", (data) => {
    console.log(data.message.message)
})

kickChat.on("messageSend", (data) => {
    console.log(data.message.message)
})