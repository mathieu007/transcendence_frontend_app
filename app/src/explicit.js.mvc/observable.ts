// import { Component } from "./component";
import { DomNodeModelBinding } from "./model.binding";
import { isObjectType, isPrimitive, removeByReference } from "./utils";

// interface Callback<T> {
// 	(this: Component, data: T, property: string | symbol, oldValue: object, newValue: object): void;
// }

export class DomObservableModel extends DomNodeModelBinding {
    private _observable: Observable<DomObservableModel>;
    constructor() {
        super();
        this._observable = new Observable<DomObservableModel>(this);
    }
}

export class Observable<T extends DomNodeModelBinding> {
    private _callbacks: Array<(data: T, property: string | symbol, oldValue: object, newValue: object) => void>;

    public getCallbacks(): Array<(data: T, property: string | symbol, oldValue: object, newValue: object) => void> {
        return this._callbacks;
    }
    private _domNodeCallbacks: Map<
        string,
        (data: T, property: string | symbol, oldValue: object, newValue: object) => void
    > = new Map();
    private _data: T;

    constructor(data: T) {
        this._data = this.createObservable(data);
        this._callbacks = new Array<(data: T) => void>();
        this._domNodeCallbacks = new Map();
    }

    // wacth out you can add the same callback multiple time.
    // it's your responsibility to ensure, you add the callback only once.
    public addCallback(callback: (data: T, property: string | symbol, oldValue: object, newValue: object) => void) {
        this._callbacks?.push(callback);
    }

    public removeCallback(callback: (data: T, property: string | symbol, oldValue: object, newValue: object) => void) {
        removeByReference(this._callbacks, callback);
    }

    protected updateDomNodeFunc(data: T, propertyPath: string | symbol, oldValue: object, newValue: object): void {
        void oldValue;
        const key = String(propertyPath);
        data.updateDomNodes(key, newValue);
    }

    private setArrayValue(target: T & any[], property: string, newValue: any, tryFireCallbacks: boolean) {
        const index = Number(property);
        if (index >= target.length) {
            target.length = index + 1;
        }
        const oldValue = target[index] as unknown;
        if (oldValue !== newValue) {
            target[index] = newValue;
            this.fireCallBacks(target, property, oldValue, newValue, tryFireCallbacks);
        }
    }

    private setObjectValue(target: T, property: string, newValue: any, tryFireCallbacks: boolean) {
        const oldValue = target[property as keyof T] as object;
        if (newValue !== oldValue) {
            target[property as keyof T] = newValue;
            this.fireCallBacks(target, property, oldValue, newValue, tryFireCallbacks);
        }
    }

    private setPrimitiveValue(target: T, property: string, newValue: any, tryFireCallbacks: boolean) {
        if (newValue !== target[property as keyof T]) {
            const oldValue = target[property as keyof T] as unknown;
            target[property as keyof T] = newValue;
            this.fireCallBacks(target, property, oldValue, newValue, tryFireCallbacks);
        }
    }

    private setValueAny(target: T, property: string, newValue: any, tryFireCallbacks: boolean) {
        // if (Array.isArray(target) && !isNaN(Number(property))) {
        //     this.setArrayValue(target, property, newValue, tryFireCallbacks);
        // }
        if (isPrimitive(newValue)) {
            this.setPrimitiveValue(target, property, newValue, tryFireCallbacks);
        }
    }

    private fireCallBacks(target: T, property: string, oldValue: any, newValue: any, tryFireCallbacks: boolean): void {
        if (tryFireCallbacks) {
            this._callbacks.forEach((callback) => {
                callback(target, property, oldValue, newValue);
            });
            if (target.hasDomNodeBinders(property) && !this._domNodeCallbacks.has(property)) {
                this._domNodeCallbacks.set(property, this.updateDomNodeFunc);
            }
            const domNodeUpdateCallback = this._domNodeCallbacks.get(property);
            if (domNodeUpdateCallback !== undefined) {
                domNodeUpdateCallback(target, property, oldValue, newValue);
            }
        }
    }

    public hasDomNodeBinding(objName: string, propertyName: string): boolean {
        return (
            !DomNodeModelBinding.includedProperties.has(objName) ||
            DomNodeModelBinding.includedProperties.get(objName)?.indexOf(propertyName) === -1
        );
    }

    private createObservable(data: T): T {
        // let key = "data";
        const handler: ProxyHandler<T> = {
            set: (target, property, value) => {
                const objName = target.constructor.name;
                const propertyName = String(property);
                if (!this.hasDomNodeBinding(objName, propertyName)) {
                    this.setValueAny(target, propertyName, value, false);
                } else if (Array.isArray(target) && property === "length") {
                    this.setObjectValue(target, propertyName, value, true);
                } else if (isPrimitive(value)) {
                    this.setPrimitiveValue(target, propertyName, value, true);
                } else if (isObjectType(value)) {
                    this.setObjectValue(target, propertyName, value, true);
                } else if (value === null || value === undefined) {
                    this.setPrimitiveValue(target, propertyName, value, true);
                }
                return true;
            }
        };
        return new Proxy(data, handler) as T;
    }

    // private createNestedObservable<U extends DomNodeModelBinding>(data: U): U {
    //     const handler: ProxyHandler<U> = {
    //         set: (target, property, value) => {
    //             const name = target.constructor.name;
    //             const propertyName = String(property);
    //             if (
    //                 !DomNodeModelBinding.includedProperties.has(name) ||
    //                 DomNodeModelBinding.includedProperties
    //                     .get(name)
    //                     ?.indexOf(propertyName) === -1
    //             ) {
    //                 target[property as keyof U] = value;
    //                 return true;
    //             }
    //             if (
    //                 Array.isArray(target) &&
    //                 typeof property === "string" &&
    //                 !isNaN(Number(property))
    //             ) {
    //                 // Array specific handling
    //                 const index = Number(property);
    //                 if (index >= target.length) {
    //                     target.length = index + 1; // Adjust the length if the index is out of bounds
    //                 }
    //                 key += "[" + index + "]";
    //                 const oldValue = target[index];
    //                 target[index] = this.createNestedObservable(value, key);
    //                 if (this._callbacks !== undefined) {
    //                     this._callbacks.forEach((callback) => {
    //                         callback(this._data, property, oldValue, value);
    //                     });
    //                 }
    //             } else if (typeof value === "object" && value !== null) {
    //                 key += "." + (property as string);
    //                 target[property as keyof U] = this.createNestedObservable(
    //                     value,
    //                     key
    //                 );
    //             } else {
    //                 // Otherwise, set the value and invoke the callback
    //                 if (value !== target[property as keyof U]) {
    //                     key += "." + (property as string);
    //                     const oldValue = target[property as keyof U] as object;
    //                     target[property as keyof U] = value;
    //                     if (this._callbacks !== undefined) {
    //                         this._callbacks.forEach((callback) => {
    //                             callback(this._data, property, oldValue, value);
    //                         });
    //                     }
    //                 }
    //             }
    //             return true;
    //         }
    //     };
    //     return new Proxy(data, handler) as U;
    // }

    get data(): T {
        return this._data;
    }

    set data(dat: T) {
        this._data = dat;
    }
}
