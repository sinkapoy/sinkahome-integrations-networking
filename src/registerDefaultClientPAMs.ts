import { ActionsComponent, type HomeEngineT, PropertiesComponent, PropertyAccessMode, createGadget, homeEngine } from '@sinkapoy/home-core';
import { type ISocketClientEvents } from './interfaces';
import { type IServerDefaultSend } from './defaultMsgs';
import { SocketClientGadget } from './components';
import { type w3cwebsocket } from 'websocket';

export function registerDefaultClientPAMs () {
    const engine = homeEngine as unknown as HomeEngineT<ISocketClientEvents>;
    engine.emit('networking:client-register-PAM', 'gadget-list', (msg: IServerDefaultSend['gadget-list'], ws: w3cwebsocket) => {
        for (const uuid of msg.gadgets) {
            if (engine.getEntityByName(uuid)) continue;
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
            propsComponent.createPropertyFromJson(prop);
        }
    });

    engine.emit('networking:client-register-PAM', 'gadget-props-update', (msg: IServerDefaultSend['gadget-props-update'], ws: w3cwebsocket) => {
        const entity = engine.getEntityByName(msg.gadget);
        if (!entity) return;
        const propsComponent = entity.get(PropertiesComponent);
        if (!propsComponent) return;
        const property = propsComponent.get(msg.prop.id);
        if (property) {
            const keys = Object.keys(msg.prop) as ['value', 'max', 'min'];
            for (let i = 0; i < keys.length; i++) {
                property[keys[i]] = msg.prop[keys[i]];
            }
            if (property.accessMode & PropertyAccessMode.notify) {
                engine.emit('gadgetPropertyEvent', entity, property);
            }
        }
    });

    engine.emit('networking:client-register-PAM', 'new-gadget', (msg: IServerDefaultSend['new-gadget'], ws: w3cwebsocket) => {
        const entity = engine.getEntityByName(msg.uuid);
        if (!entity) {
            const gadget = createGadget(msg.uuid, false);
            gadget.add(new SocketClientGadget(ws.url));
        }
        engine.emit('networking:client-send', {
            comand: 'gadget-props',
            gadget: msg.uuid,
        }, ws.url);
        engine.emit('networking:client-send', {
            comand: 'gadget-actions',
            gadget: msg.uuid,
        }, ws.url);
    });

    engine.emit('networking:client-register-PAM', 'remove-gadget', (msg: IServerDefaultSend['remove-gadget'], ws: w3cwebsocket) => {
        const entity = engine.getEntityByName(msg.uuid);
        if (entity) {
            engine.removeEntity(entity);
        }
    });

    engine.emit('networking:client-register-PAM', 'gadget-actions', (msg: IServerDefaultSend['gadget-actions'], ws: w3cwebsocket) => {
        const entity = engine.getEntityByName(msg.gadget);
        if (!entity) return;
        const actionsComponent = entity.get(ActionsComponent);
        if (!actionsComponent) return;
        for (const prop of msg.actions) {
            actionsComponent.addFromJson(prop);
        }
    });
}
