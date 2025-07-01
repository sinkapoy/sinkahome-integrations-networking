import { ActionT, type IProperty, type uuidT } from '@sinkapoy/home-core';

export type DefaultNetworkCommandsT =
    | 'gadget-list'
    | 'gadget-props'
    | 'gadget-actions'
    | 'gadget-events'
    | 'gadget-props-update' // server only
    | 'gadget-write-props' // client only
    ;

export interface IClientDefaultSend extends Record<DefaultNetworkCommandsT, object> {
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
    };
    'gadget-write-props': {
        comand: 'gadget-write-props';
        gadget: uuidT;
        props: { id: string; value: number | string | boolean; }[];
    };
    'call-gadget-action': {
        comand: 'call-gadget-action';
        gadget: uuidT;
        action: string;
        args: any[];
    };
}

export interface IServerDefaultSend extends Record<DefaultNetworkCommandsT, object> {
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
        actions: ActionT[];
    };
    'gadget-action-update': {
        comand: 'gadget-action-update';
        gadget: uuidT;
        action: ActionT;
    };
    'gadget-props-update': {
        comand: 'gadget-props-update';
        gadget: uuidT;
        prop: IProperty;
    };
    'new-gadget': {
        comand: 'new-gadget';
        uuid: uuidT;
    };
    'remove-gadget': {
        comand: 'remove-gadget';
        uuid: uuidT;
    };
}
