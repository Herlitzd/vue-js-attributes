import 'reflect-metadata';
import { Vue as _Vue } from 'vue/types/vue';
import { PluginFunction, PluginObject } from 'vue/types/plugin';
import * as classComponent from 'vue-class-component';


import { PropOptions } from 'vue';

class DependencyInjectionAttributePlugin {
    install(Vue: typeof _Vue, options?: any) {
        Vue.mixin({
            provide: getNewServices(),
        });
    }
}
export const DependencyInjectionAttribute: PluginObject<any> = new DependencyInjectionAttributePlugin();

function getNewServices() {
    let newServices = {};
    for (let key in serviceDefs) {
        if (serviceDefs.hasOwnProperty(key)) {
            newServices[key] = new serviceDefs[key]();
        }
    }
    return newServices;
}

// [Key:ServiceName, Value: ServiceConstructor]
let serviceDefs = {};

export function Service(target: Function) {
    serviceDefs[target.name] = target;
}

let classDefs = {};

export type Constructor = {
    new(...args: any[]): any
};

export function Import(options = {}) {
    if (options === void 0) { options = {}; }
    return function (target, key) {
        //Not a Vue Component
        if(!target.__proto__.constructor.name.includes('Vue')){
            let type = Reflect.getMetadata('design:type', target, key);
            target[key] = new serviceDefs[type.name]();
            return;
        }

        //A Vue Component
        if (!Array.isArray(options) && typeof options['type'] === 'undefined') {
            options['type'] = Reflect.getMetadata('design:type', target, key);
        }
        classComponent.createDecorator(function (componentOptions, k) {
            if (typeof componentOptions.inject === 'undefined') {
                componentOptions.inject = {};
            }
            if (!Array.isArray(componentOptions.inject)) {
                componentOptions.inject[key] = options['type'].name || key;
            }
        })(target, key);
    };
}