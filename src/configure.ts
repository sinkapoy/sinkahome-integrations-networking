import { VM_TYPE, checkVM, homeEngine } from "@root/../../core/dist/core";
import { SocketServerSystem } from "./SocketServer";
import { SocketClientSystem } from "./SocketClient";
import { registerDefaultServerPAMs } from "./registerDefaultServerPAMs";

export interface ISocketClientConfig {
    url: string;
}

interface IConfigureOptions {
    port: number;
    clientsConfig: ISocketClientConfig[];
}

export function configureNetworking(opt?: Partial<IConfigureOptions>) {
    const params: IConfigureOptions = {
        port: 9000,
        clientsConfig: [],
    }

    if (opt) {
        Object.assign(params, opt);
    }
    console.log(checkVM())
    if (checkVM() === VM_TYPE.nodejs) {
        homeEngine.addSystem(new SocketServerSystem(params.port), Number.MAX_SAFE_INTEGER);
    }
    params.clientsConfig.forEach(config => {
        homeEngine.addSystem(new SocketClientSystem(config.url, params.port), Number.MAX_SAFE_INTEGER);
    })

    registerDefaultServerPAMs();
}