export const paramMetadataStorage = new Map<Constructor<any>, Map<number, string>>();

export interface Constructor<T> {
    new (...args: any[]): T;
    dependencies?: Map<string, Constructor<any>>;
    dependencies_instances?: Array<any>;
    inject_key?: string;
    is_singleton?: boolean;
    instance?: T | undefined;
    factory?: Function;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

const registry = new Map<string, Constructor<any>>();
export class Container {
    static register<T>(key: string, construct: Constructor<T>): T {
        if (key === "HomeController") {
            let i = 0;
        }
        if (key === "AppModel") {
            let i = 0;
        }
        if (!registry.has(key)) {
            registry.set(key, construct);
            construct.inject_key = key;
            construct.is_singleton = true;
            construct.instance = undefined;
            if (construct.dependencies) {
                construct.dependencies.forEach((value, key) => {
                    const dep = Container.register(key, value);
                    construct.dependencies_instances.unshift(dep);
                });
                const deps = construct.dependencies_instances;
                construct.instance = new construct(...deps);
            } else {
                construct.instance = new construct();
            }
        }
        let val = registry.get(key);
        return val.instance;
    }

    // static registerFactory<T>(key: string, factory: () => T) {
    //     if (!registry.has(key)) {
    //         registry.set(key, { factory });
    //     }
    // }

    // static getParameters(key: string): Array<unknown> {
    //     const entry = registry.get(key);
    //     if (entry && entry.construct) {
    //         const constructorParams = paramMetadataStorage.get(entry.construct) || new Map();
    //         const dependencies = Array.from(constructorParams.keys())
    //             .sort()
    //             .map((index) => {
    //                 const depKey = constructorParams.get(index);
    //                 if (!depKey) {
    //                     throw new Error(`Dependency injection key not found for parameter at index ${index}.`);
    //                 }
    //                 return this.get(depKey);
    //             });
    //         return dependencies;
    //     }
    //     return null;
    // }

    // static get<T>(key: string | Constructor<T>): T {
    //     if (typeof key !== "string") key = (key as Constructor<T>).name;
    //     const entry = registry.get(key);
    //     if (!entry) {
    //         throw new Error(`No entry found for key ${key}.`);
    //     }
    //     // If an instance already exists, return it (singleton behavior)
    //     if (entry.instance) {
    //         return entry.instance;
    //     }
    //     if (entry.factory) {
    //         const instance = entry.factory();
    //         entry.instance = instance; // cache the instance for singleton behavior
    //         return instance;
    //     }
    //     // Attempt to resolve constructor dependencies
    //     if (entry.construct) {
    //         const constructorParams = paramMetadataStorage.get(entry.construct) || new Map();
    //         const dependencies = Array.from(constructorParams.keys())
    //             .sort()
    //             .map((index) => {
    //                 const depKey = constructorParams.get(index);
    //                 if (!depKey) {
    //                     throw new Error(`Dependency injection key not found for parameter at index ${index}.`);
    //                 }
    //                 return this.get(depKey);
    //             });
    //         // Instantiate with resolved dependencies
    //         let constructor = entry.constructor as Constructor<T>;
    //         const instance = new constructor(...dependencies);
    //         // Optionally cache the instance for singleton behavior
    //         entry.instance = instance;
    //         return instance;
    //     }
    //     throw new Error(`No factory or constructor found for key ${key}.`);
    // }
}

// in order to know which parameters of the constructor (index) should be injected (identified by key)
interface Injection {
    index: number;
    key: string;
}

// add to class which has constructor paramteters marked with @inject()
export function injectionTarget() {
    return function injectionTarget<T extends { new (...args: any[]): object }>(constructor: T): T | void {
        // replacing the original constructor with a new one that provides the injections from the Container
        // return class extends constructor {
        //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
        //     constructor(...args: any[]) {
        //         // get injections from class; previously created by @inject()
        //         const injections = (constructor as any).injections as Injection[];
        //         // get the instances to inject from the Container
        //         // this implementation does not support args which should not be injected
        //         const injectedArgs: any[] = injections.map(({ key }) => {
        //             console.log(`Injecting an instance identified by key ${key}`);
        //             return Container.get(key);
        //         });
        //         // call original constructor with injected arguments
        //         super(...injectedArgs);
        //     }
        // };
    };
}

// this stores the information about the properties which should be injected
export function inject(key: string, constructor?: Constructor<any>): ParameterDecorator {
    return function (target: Constructor<any>, propertyKey: string | symbol, parameterIndex: number) {
        if (!constructor || !key) throw new Error("No Injection key supplied.");
        if (!target.dependencies) target.dependencies = new Map();
        if (!target.dependencies_instances) target.dependencies_instances = new Array();
        constructor.inject_key = key;
        constructor.is_singleton = true;
        target.dependencies.set(key, constructor);
        if (!registry.has(key)) {
            Container.register(key, constructor);
        }
        // target.dependencies.set(key, constructor);
        // const existingParams: Map<number, string> = paramMetadataStorage.get(target) || new Map();
        // existingParams.set(parameterIndex, key);
        // paramMetadataStorage.set(target, existingParams);
    };
}
