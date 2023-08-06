import { HomeEngineT, PropertiesComponent, Property, createGadget, homeEngine, uuidT } from "@sinkapoy/home-core";
import { ISocketClientEvents } from "./interfaces";
import { IServerDefaultSend } from "./defaultMsgs";
import { SocketClientGadget } from "./components";
import { w3cwebsocket } from "websocket";

export function registerDefaultClientPAMs() {
    console.log('register pam')
    const engine = homeEngine as unknown as HomeEngineT<ISocketClientEvents>;
    engine.emit('networking:client-register-PAM', 'gadget-list', (msg: IServerDefaultSend['gadget-list'], ws: w3cwebsocket) => {
        console.log('got gadget list');
        for (const uuid of msg.gadgets) {
            const gadget = createGadget(uuid, false);
            
            gadget.add(new SocketClientGadget(ws.url));
            engine.addEntity(gadget);
            engine.emit('networking:client-send', {
                comand: 'gadget-props',
                gadget: uuid,
            }, ws.url);
            engine.emit('networking:client-send', {
                comand: 'gadget-actions',
                gadget: uuid,
            }, ws.url);
        }
    });

    engine.emit('networking:client-register-PAM', 'gadget-props', (msg: IServerDefaultSend['gadget-props'], ws: w3cwebsocket) => {
        const entity = engine.getEntityByName(msg.gadget);
        if (!entity) return;
        const propsComponent = entity.get(PropertiesComponent);
        if (!propsComponent) return;
        for (const prop of msg.props) {
            propsComponent.set(prop.id, new Property(
                prop.id,
                prop.accessMode,
                prop.value,
                prop.min,
                prop.max
            ));
        }
    })


}