import { HomeEngineT, createGadget, homeEngine, uuidT } from "@sinkapoy/home-core";
import { ISocketClientEvents } from "./interfaces";
import { IServerDefaultSend } from "./defaultMsgs";
import { SocketClientGadget } from "./components";
import { connection as WebSocket } from "websocket";
export function registerDefaultClientPAMs() {
    console.log('register pam')
    const engine = homeEngine as unknown as HomeEngineT<ISocketClientEvents>;
    engine.emit('networking:client-register-PAM', 'gadget-list', (msg: IServerDefaultSend['gadget-list'], ws: WebSocket) => {
        console.log('got gadget list');
        for (const uuid of msg.gadgets) {
            const gadget = createGadget(uuid, false);
            gadget.add(new SocketClientGadget(ws.remoteAddress));
            engine.addEntity(gadget);
            engine.emit('networking:client-send', {
                comand: 'gadget-props',
            }, ws.remoteAddress);
            engine.emit('networking:client-send', {
                comand: 'gadget-actions',
            }, ws.remoteAddress);
        }
    });


}