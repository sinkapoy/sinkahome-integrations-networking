import { SocketClientGadget } from './components';
import { type Entity } from '@ash.ts/ash';
import { ArrayMap, HomeSystem } from '@sinkapoy/home-core';
import { w3cwebsocket as WebSocket } from 'websocket';
import { type ISocketClientEvents, type SocketClientRecievePAMT } from './interfaces';
import { type IClientDefaultSend } from './defaultMsgs';

export class SocketClientSystem extends HomeSystem<ISocketClientEvents> {
    private socket: WebSocket;
    private readonly recievePAMs = new ArrayMap<string, SocketClientRecievePAMT[]>();
    private readonly queue: string[] = [];
    constructor (private readonly url: string, private readonly port: number) {
        super();
        this.connect();
    }

    onInit (): void {
        this.setupEvent('networking:client-send', this.send);
        this.setupEvent('networking:client-register-PAM', this.registerPAM);
        this.setupEvent('writeGadgetProperty', this.onPropertyWrite);
        this.setupEvent('invokeGadgetAction', this.onActionInvoke);
    }

    onDestroy (): void {

    }

    onUpdate (_dt: number): void {
        if (this.socket.readyState === this.socket.CLOSED) {
            this.connect();
        }
    }

    private connect () {
        this.socket = new WebSocket(this.url + ':' + this.port, undefined, undefined, undefined, undefined);
        console.debug('started socket to ', this.url, this.port);

        this.socket.onopen = () => {
            this.engine.emit('networking:client-connection-established', this.socket);
            console.debug('socket connection establihed to ' + this.socket.url);
            this.queue.forEach(msg => { this.socket.send(msg); });
        };
        this.socket.onmessage = (msg) => { this.recieve(msg.data as string); };
        this.socket.onerror = (error) => {
            console.error(error);
            setTimeout(() => { this.connect(); }, 500);
        };
    }

    private readonly send = (msg: object, url?: string) => {
        if (url) {
            if (url !== this.socket.url) return;
        }
        if (this.socket) {
            if (this.socket.readyState === this.socket.OPEN) {
                this.socket.send(JSON.stringify(msg));
                return;
            }
        }
        this.queue.push(JSON.stringify(msg));
    };

    private readonly registerPAM = (comand: string, pam: SocketClientRecievePAMT) => {
        this.recievePAMs.get(comand).push(pam);
    };

    private recieve (msg: string) {
        const data = JSON.parse(msg) as { comand?: string; };
        if (!data.comand) return;

        this.recievePAMs.get(data.comand).forEach(pam => {
            pam(data, this.socket);
        });
    }

    private readonly onPropertyWrite = (entity: Entity, id: string, value: string | number | boolean) => {
        const wsComponent = entity.get(SocketClientGadget);
        if (!wsComponent) return;
        if (wsComponent.remote !== this.socket.url) { return; }
        this.send(<IClientDefaultSend['gadget-write-props']>{
            comand: 'gadget-write-props',
            gadget: entity.name,
            props: [{ id, value }],
        }, this.socket.url);
    };

    private readonly onActionInvoke = (entity: Entity, id: string, ...args: any[]) => {
        const wsComponent = entity.get(SocketClientGadget);
        if (!wsComponent) return;
        if (wsComponent.remote !== this.socket.url) { return; }
        this.send(<IClientDefaultSend['call-gadget-action']>{
            comand: 'call-gadget-action',
            gadget: entity.name,
            action: id,
            args,
        }, this.socket.url);
    };
}
