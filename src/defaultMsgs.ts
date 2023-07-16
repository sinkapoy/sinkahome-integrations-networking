import { IProperty, uuidT } from "@sinkapoy/home-core";

export type DefaultNetworkCommandsT = 
| 'gadget-list'
| 'gadget-props'
| 'gadget-actions'
| 'gadget-events'
| 'gadget-props-update' // server only
;

export interface IClientDefaultSend extends Record<DefaultNetworkCommandsT, object>{
    'gadget-list': {
        comand: 'gadget-list';
    };
    'gadget-props': {
        comand: 'gadget-props';
        gadget: uuidT;
    };
    'gadget-actions': {
        comand: 'gadget-actions';
        gadget: uuidT;
    }
}

export interface IServerDefaultSend extends Record<DefaultNetworkCommandsT, object>{
    'gadget-list': {
        comand: 'gadget-list';
        gadgets: uuidT[];
    };
    'gadget-props': {
        comand: 'gadget-props';
        gadget: uuidT;
        props: IProperty[];
    };
    'gadget-actions': {
        comand: 'gadget-actions';
        gadget: uuidT;
        actions: unknown[];
    };
    'gadget-props-update': {
        comand: 'gadget-props-update';
        gadget: uuidT;
        prop: IProperty;
    }
}