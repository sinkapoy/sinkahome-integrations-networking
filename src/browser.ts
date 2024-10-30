import { homeEngine } from '@sinkapoy/home-core';
import { type IConfigureOptions } from './interfaces';
import { SocketClientSystem } from './SocketClient';
import { registerDefaultClientPAMs } from './registerDefaultClientPAMs';

export * from './interfaces';

export function configureNetworking (opt?: Partial<IConfigureOptions>) {
    const params: IConfigureOptions = {
        port: 9000,
        clientsConfig: [],
    };

    if (opt) {
        Object.assign(params, opt);
    }

    params.clientsConfig.forEach(config => {
        homeEngine.addSystem(new SocketClientSystem(config.url, params.port), Number.MAX_SAFE_INTEGER);
    });
    console.debug('configure networking with', opt);
    registerDefaultClientPAMs();
}
