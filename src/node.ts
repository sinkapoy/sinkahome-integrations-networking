import { checkVM, VM_TYPE, homeEngine } from "@sinkapoy/home-core";
import { IConfigureOptions } from './interfaces';
import { SocketServerSystem } from "./SocketServer";
import { SocketClientSystem } from "./SocketClient";
import { registerDefaultServerPAMs } from "./registerDefaultServerPAMs";
import { registerDefaultClientPAMs } from "./registerDefaultClientPAMs";
export * from './interfaces';

export function configureNetworking(opt?: Partial<IConfigureOptions>) {
    if (process.env['browser']) return;

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
    registerDefaultClientPAMs();
}