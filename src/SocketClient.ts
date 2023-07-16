import { ArrayMap, HomeSystem } from "@sinkapoy/home-core";
import { w3cwebsocket as WebSocket } from "websocket";
import { ISocketClientEvents, SocketClientRecievePAMT } from "./interfaces";

export class SocketClientSystem extends HomeSystem<ISocketClientEvents> {
    private socket: WebSocket;
    private recievePAMs = new ArrayMap<string, SocketClientRecievePAMT[]>();
    private queue: string[] = [];
    constructor(private url: string, private port: number) {
        super();
        this.socket = new WebSocket(url + ':' + port, undefined, undefined, undefined, undefined);
        console.log('started socket to ', this.url, this.port);

        this.socket.onopen = () => {
            this.engine.emit('networking:client-connection-established', this.socket);
            console.log('socket connection establihed to ' + this.socket.url);  
            this.queue.forEach(msg=>this.socket.send(msg));
        };
        this.socket.onmessage = (msg)=>this.recieve(msg.data as string);
    }

    onInit(): void {
        this.setupEvent('networking:client-send', this.send);
        this.setupEvent('networking:client-register-PAM', this.registerPAM);
    }

    onDestroy(): void {

    }

    onUpdate(dt: number): void {

    }

    private send = (msg: object, url?: string)=>{
        if(url){
            if(url !== this.socket.url) return;
        }
        if(this.socket){
            if(this.socket.readyState === this.socket.OPEN){
                this.socket.send(JSON.stringify(msg));
                console.log('send', msg);
                return;
            }
        }
        this.queue.push(JSON.stringify(msg));
    }

    private registerPAM = (comand: string, pam: SocketClientRecievePAMT)=>{
        console.log('register pam', comand);
        this.recievePAMs.get(comand).push(pam);
    }

    private recieve(msg: string){
        
        const data = JSON.parse(msg) as {comand?: string};
        console.log('recieved', data);
        if(!data.comand) return;
        console.log(this.recievePAMs);

        this.recievePAMs.get(data.comand).forEach(pam=>{
            console.log('apply pam')
            pam(data, this.socket);
        });
    }
}