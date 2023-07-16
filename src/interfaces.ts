import type { IHomeCoreEvents } from "@sinkapoy/home-core";
import type { DefaultNetworkCommandsT } from "./defaultMsgs";
import type { connection as WebSocket } from "websocket";

type urlT = string;
export type SocketRecievePAMT = (msg: any | object, client: WebSocket) => void;

export interface ISocketClientEvents extends IHomeCoreEvents {
    'networking:client-send': [object, urlT] | [object];
    'networking:client-connection-established': [urlT];
    'networking:client-register-PAM': [DefaultNetworkCommandsT | string, SocketRecievePAMT];

}

export interface ISocketServerEvents extends IHomeCoreEvents {
    'networking:server-send': [object, WebSocket] | [object];
    'networking:server-register-PAM': [DefaultNetworkCommandsT | string, SocketRecievePAMT];
}