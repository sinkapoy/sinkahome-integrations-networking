import { GadgetComponent, HomeEngineT, IProperty, PropertiesComponent, homeEngine } from "@sinkapoy/home-core";
import type { ISocketServerEvents } from "./interfaces";
import { IClientDefaultSend, IServerDefaultSend } from "./defaultMsgs";
export function registerDefaultServerPAMs() {
    const engine = homeEngine as unknown as HomeEngineT<ISocketServerEvents>;

    engine.emit('networking:server-register-PAM', 'gadget-list', function (_, ws) {
        const toSend: string[] = [];

        homeEngine.entities.forEach(entity => {
            const data = entity.get(GadgetComponent);
            if (data?.own) {
                toSend.push(data.uuid);
            }
        });

        engine.emit('networking:server-send', {
            command: 'gadget-list',
            gadgets: toSend,
        }, ws);
    });

    engine.emit('networking:server-register-PAM', 'gadget-props', (msg: IClientDefaultSend['gadget-props'], ws) => {
        const gadget = engine.getEntityByName(msg.gadget);
        if (!gadget) return;
        const props = gadget.get(PropertiesComponent);
        if (!props) return;
        const toSend: IProperty[] = [];
        props.forEach(p => {
            toSend.push(p);
        });

        engine.emit('networking:server-send', <IServerDefaultSend['gadget-props']>{
            comand: 'gadget-props',
            gadget: msg.gadget,
            props: toSend,
        }, ws);
    });

    // legacy transport
    engine.emit('networking:server-register-PAM', 'getGadgets', function (_, ws) {
        const toSend: string[] = [];

        homeEngine.entities.forEach(entity => {
            const data = entity.get(GadgetComponent);
            if (data?.own) {
                toSend.push(data.uuid);
            }
        });

        engine.emit('networking:server-send', {
            command: 'receiveGadgets',
            gadgets: toSend,
        }, ws);
    });

    engine.emit('networking:server-register-PAM', 'gadget-props', (msg: IClientDefaultSend['gadget-props'], ws) => {
        const gadget = engine.getEntityByName(msg.gadget);
        if (!gadget) return;
        const props = gadget.get(PropertiesComponent);
        if (!props) return;
        const toSend: IProperty[] = [];
        props.forEach(p => {
            toSend.push(p);
        });

        engine.emit('networking:server-send', <IServerDefaultSend['gadget-props']>{
            comand: 'gadget-props',
            gadget: msg.gadget,
            props: toSend,
        }, ws);
    });
}