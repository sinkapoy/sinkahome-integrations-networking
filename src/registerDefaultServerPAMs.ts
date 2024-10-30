import { ActionsComponent, GadgetComponent, type HomeEngineT, type IAction, type IProperty, PropertiesComponent, homeEngine } from '@sinkapoy/home-core';
import type { ISocketServerEvents } from './interfaces';
import { type IClientDefaultSend, type IServerDefaultSend } from './defaultMsgs';
export function registerDefaultServerPAMs () {
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
            comand: 'gadget-list',
            gadgets: toSend,
        }, ws);
    });

    engine.emit('networking:server-register-PAM', 'gadget-props', (msg: IClientDefaultSend['gadget-props'], ws) => {
        const gadget = engine.getEntityByName(msg.gadget);
        if (!gadget) { console.error('cant find gadget to get props: ' + msg.gadget); return; }
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
    // todo: remove
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

    engine.emit('networking:server-register-PAM', 'gadget-write-props', (msg: IClientDefaultSend['gadget-write-props'], ws) => {
        const gadget = engine.getByUUID(msg.gadget);
        if (!gadget) return;
        for (let i = 0; i < msg.props.length; i++) {
            const propWrite = msg.props[i];
            engine.emit('writeGadgetProperty', gadget, propWrite.id, propWrite.value);
        }
    });

    engine.emit('networking:server-register-PAM', 'gadget-actions', function (msg: IClientDefaultSend['gadget-actions'], ws) {
        const entity = engine.getEntityByName(msg.gadget);
        if (!entity) return;
        const actions = entity.get(ActionsComponent);
        if (!actions) return;

        const list: IAction[] = [];
        for (const action of actions.values()) {
            list.push(
                action,
            );
        }
        engine.emit('networking:server-send', {
            comand: 'gadget-actions',
            gadget: msg.gadget,
            actions: list,
        }, ws);
    });

    engine.emit('networking:server-register-PAM', 'call-gadget-action', function (msg: IClientDefaultSend['call-gadget-action'], ws) {
        const entity = engine.getByUUID(msg.gadget);
        if (!entity) return;
        engine.emit('invokeGadgetAction', entity, msg.action, ...msg.args);
    });
}
