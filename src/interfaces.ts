import type { IHomeCoreEvents } from '@sinkapoy/home-core';
import type { DefaultNetworkCommandsT, IClientDefaultSend, IServerDefaultSend } from './defaultMsgs';
import type { connection as WebSocket, w3cwebsocket } from 'websocket';

type urlT = string;
export type SocketServerRecievePAMT = (msg: any | object, client: WebSocket) => void;
export type SocketClientRecievePAMT = (msg: any | object, server: w3cwebsocket) => void;
export interface ISocketClientEvents extends IHomeCoreEvents {
    'networking:client-send': [object | IClientDefaultSend[keyof IClientDefaultSend], urlT] | [object | IClientDefaultSend[keyof IClientDefaultSend]];
    'networking:client-connection-established': [w3cwebsocket];
    'networking:client-register-PAM': [DefaultNetworkCommandsT | string, SocketClientRecievePAMT];

}

export interface ISocketServerEvents extends IHomeCoreEvents {
    'networking:server-send': [object | IServerDefaultSend[keyof IServerDefaultSend], WebSocket] | [object | IServerDefaultSend[keyof IServerDefaultSend]];
    'networking:server-register-PAM': [DefaultNetworkCommandsT | string, SocketServerRecievePAMT];
}

export interface ISocketClientConfig {
    url: string;
}

export interface IConfigureOptions {
    port: number;
    clientsConfig: ISocketClientConfig[];
}
