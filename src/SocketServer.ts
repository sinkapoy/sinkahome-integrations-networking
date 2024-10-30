import { defineNode, Entity, type NodeList } from '@ash.ts/ash';
import { ArrayMap, GadgetComponent, GadgetNode, HomeSystem, type IProperty } from '@sinkapoy/home-core';
import { type Server as HTTPServer, createServer } from 'http';
import { type IUtf8Message, type connection as WebSocket, server as WebSocketServer } from 'websocket';
import { type ISocketServerEvents, type SocketServerRecievePAMT } from './interfaces';
import { type IServerDefaultSend } from './defaultMsgs';

class WebSocketClientComponent {
    watchdogTimer = 5011;
    watchdogCountdown = this.watchdogTimer;
    constructor (
        public readonly ws: WebSocket,
    ) { }
}

class WebSocketNode extends defineNode({
    data: WebSocketClientComponent,
}) { }

export class SocketServerSystem extends HomeSystem<ISocketServerEvents> {
    private server!: WebSocketServer;
    private httpServer!: HTTPServer;
    private readonly sockets = new Map<WebSocket, WebSocketNode>();
    private readonly recievePAMs = new ArrayMap<string, SocketServerRecievePAMT[]>();
    private clients!: NodeList<WebSocketNode>;
    private gadgetsList: NodeList<GadgetNode>;

    constructor (
        private readonly port: number,
    ) {
        super();
    }

    onInit (): void {
        this.httpServer = createServer();
        this.httpServer.listen(this.port);
        this.server = new WebSocketServer({ httpServer: this.httpServer, autoAcceptConnections: true });

        this.clients = this.setupNodeList({
            node: WebSocketNode,
            onAdd: this.onAddClient,
            onUpdate: this.onUpdateClient,
            onRemove: this.onRemoveClient,
        });

        this.gadgetsList = this.setupNodeList({
            node: GadgetNode,
            onAdd: this.onAddGadget,
            onRemove: this.onRemoveGadget,
        });

        this.server.on('connect', (ws) => {
            const entity = new Entity();
            entity.add(new WebSocketClientComponent(ws));
            this.engine.addEntity(entity);
        });

        this.setupEvent('networking:server-register-PAM', this.registerRecievePAM);
        this.setupEvent('networking:server-send', this.sendMsg);
        this.setupEvent('gadgetPropertyEvent', (entity: Entity, property: IProperty) => {
            if (entity.get(GadgetComponent)?.own) {
                this.engine.emit('networking:server-send', <IServerDefaultSend['gadget-props-update']>{
                    comand: 'gadget-props-update',
                    gadget: entity.name,
                    prop: property,
                });
            }
        });
    }

    onDestroy (): void {

    }

    onUpdate (dt: number): void {
        // todo: add check keepAlive
    }

    private readonly onAddClient = (node: WebSocketNode) => {
        const entity = node.entity;
        this.sockets.set(node.data.ws, node);
        node.data.ws.on('message', data => {
            if (node.data?.ws) {
                this.recieveMsg(node.data.ws, data as IUtf8Message);
            }
        });
        node.data.ws.on('error', () => { this.engine.removeEntity(entity); });
        node.data.ws.on('close', () => { this.engine.removeEntity(entity); });
    };

    private readonly onUpdateClient = (node: WebSocketNode, dt: number) => {
        // const { data } = node;
        // data.watchdogCountdown -= dt;
        // if (data.watchdogCountdown <= 0) {
        //     node.data.ws.close();
        //     this.engine.removeEntity(node.entity);
        // }
        if (node.data.ws.state === 'closed' || !node.data.ws.connected) {
            this.engine.removeEntity(node.entity);
        }
    };

    private readonly onRemoveClient = (node: WebSocketNode) => {
        this.sockets.delete(node.data.ws);
    };

    private readonly registerRecievePAM = (comand: string, cb: SocketServerRecievePAMT) => {
        const array = this.recievePAMs.get(comand);
        array.push(cb);
    };

    private recieveMsg (ws: WebSocket, rawData: IUtf8Message) {
        let data: { comand: string; };
        const node = this.sockets.get(ws);
        if (node) {
            node.data.watchdogCountdown = node.data.watchdogTimer;
        }
        try {
            data = JSON.parse(rawData.utf8Data) as { comand: string; };
        } catch {
            // todo: add logging
            return;
        }
        if (!this.recievePAMs.has(data.comand)) {
            // todo: add logging
            console.warn('no pam for comand ' + data.comand);
            return;
        }
        this.recievePAMs.get(data.comand).forEach(cb => {
            cb(data, ws);
        });
    }

    private readonly sendMsg = (msg: object, ws?: WebSocket) => {
        const payload = JSON.stringify(msg);
        if (ws) {
            ws.sendUTF(payload);
        } else {
            for (const ws of this.sockets.keys()) {
                ws.sendUTF(payload);
            }
        }
    };

    // gadgets section

    private readonly onAddGadget = (node: GadgetNode) => {
        this.sendMsg({
            comand: 'new-gadget',
            uuid: node.entity.name,
        });
    };

    private readonly onRemoveGadget = (node: GadgetNode) => {
        this.sendMsg({
            comand: 'remove-gadget',
            uuid: node.entity.name,
        });
    };
}
