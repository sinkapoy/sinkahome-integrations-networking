import { HomeSystem } from "@sinkapoy/home-core";
import { w3cwebsocket as WebSocket } from "websocket";
import { ISocketClientEvents } from "./interfaces";

export class SocketClientSystem extends HomeSystem<ISocketClientEvents> {
    private socket: WebSocket;
    constructor(private url: string, private port: number) {
        super();
        this.socket = new WebSocket(url + ':' + port, undefined, undefined, undefined, undefined);
        console.log('started socket to ', this.url, this.port);

        this.socket.onopen = () => this.engine.emit('networking:client-connection-established', this.url);
    }

    onInit(): void {
    }

    onDestroy(): void {

    }

    onUpdate(dt: number): void {

    }
}