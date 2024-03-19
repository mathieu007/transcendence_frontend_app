import { getObjPropValue, getObjValFromPath, isObjectType, setProperty, stringToBoolean } from "./utils";

const regex = /\$\{|\}/;

export function DataBinding(target: DomNodeModelBinding, propName: string) {
    const className = target.constructor.name;
    if (!DomNodeModelBinding.includedProperties.has(className)) {
        DomNodeModelBinding.includedProperties.set(className, []);
    }
    DomNodeModelBinding.includedProperties.get(className)!.push(propName);
    // // We also add array keys as data binding, will add flags later to include or not array keys...
    // const value = getObjPropValue(target, propName);
    // if (Array.isArray(value)) {
    //     DomNodeModelBinding.includedProperties.get(className)!.push(propName);
    // }
}

export class DomNodeBindSetter {
    constructor(
        node: Node,
        getter: (...args: any[]) => any,
        setter: (elem: Node, value: any, name?: string) => void,
        args: any[],
        attributeName?: string,
        originalValue?: string
    ) {
        this.args = args;
        this.node = node;
        this.getter = getter;
        this.setter = setter;
        this.attributeName = attributeName;
        this.originalValue = originalValue;
    }
    public args: any[];
    public node: Node;
    public attributeName: string;
    public originalValue: string;
    public setter: (elem: Node, value: any, name?: string, originalValue?: string, ...args: any[]) => void;
    public getter: (...args: any[]) => any;
}

export abstract class DomNodeModelBinding {
    static includedProperties: Map<string, Array<string>> = new Map();
    private getters: Map<string, (...args: any[]) => any> = new Map();
    private _contentVarName: string;
    constructor() {}
    private _modelVarName: string;
    private _bindingSetters: Map<string, Array<DomNodeBindSetter>> = new Map<string, Array<DomNodeBindSetter>>();

    private _argsAreEqual(args: any[], args2: any[]): boolean {
        if (args.length !== args2.length) {
            return false;
        }
        for (let i = 0; i < args.length; i++) {
            if (args[i] !== args2[i]) {
                return false;
            }
        }
        return true;
    }

    public setBinding(
        node: Node,
        propPath: string,
        funcGetter: (...args: any[]) => any,
        args: any[],
        funcSetter: (elem: Node, value: any, name?: string) => void,
        attrName?: string,
        originalValue?: string
    ): void {
        let found = false;
        let binders = this._bindingSetters.get(propPath);
        if (binders === undefined) {
            binders = new Array<DomNodeBindSetter>();
            this._bindingSetters.set(propPath, binders);
        }
        for (var i = 0; i < binders.length; i++) {
            if (this._argsAreEqual(binders[i].args, args)) {
                found = true;
                break;
            }
        }
        if (!found) binders.push(new DomNodeBindSetter(node, funcGetter, funcSetter, args, attrName, originalValue));
    }

    public getPropVal(path: string): any {
        const index = path.indexOf(".");
        if (index !== -1) return getObjValFromPath(this, path.substring(index + 1));
        throw new Error(`Properties path ${path} is invalid.`);
    }

    set contentVarName(contentName: string) {
        this._contentVarName = contentName;
    }

    set modelVarName(modelVarName: string) {
        this._modelVarName = modelVarName;
    }

    // we do not need a content update function, no need binding function
    public appendVarContentNode(elem: Node, content: Element): void {
        elem.appendChild(content);
    }

    public appendTextNode(elem: Node, value: string): void {
        const textNode = new Text(value);
        elem.appendChild(textNode);
    }

    public concatenatePrimitives(args) {
        const primitives = args.filter((arg) => {
            if (arg === null) return true;
            const type = typeof arg;
            return type !== "object" && type !== "function";
        });
        const primitiveStrings = primitives.map(String);
        return primitiveStrings.join("_");
    }

    public addTextNodeCallback(elem: Node, varPath: string, getter: (...args: any[]) => any, ...args: any[]): void {
        const val = getter(args);
        let div = document.createElement("div");
        div.innerHTML = val;
        this.getters.set(varPath, getter);
        elem.appendChild(div.firstChild);
        this.setBinding(div.firstChild, varPath, getter, args, this.updateTextNodeFunc.bind(this));
    }

    public updateTextNodeFunc(
        elem: Node,
        varPath: string,
        value?: string,
        originalValue?: string,
        ...args: any[]
    ): void {
        let div = document.createElement("div");
        div.innerHTML = this.getters.get(varPath)(args);
        if (div.firstChild !== elem) elem.parentElement.replaceChild(div.firstChild, elem);
    }

    public addGetter(varPath: string, getter: (...args: any[]) => any): void {
        this.getters.set(varPath, getter);
    }

    public addAttributeCallback(
        elem: Node,
        name: string,
        value: string,
        ...args: any[]
    ): void {
        const splits = (value as string).split(regex);
        if (splits.length >= 3) {
            for (let i = 0; i < splits.length; i += 2) {
                let varPath = splits[i + 1];
                let getter = this.getters.get(varPath);
                this.setBinding(elem, varPath, getter, args, this.updateAttributeValueFunc.bind(this), name, value);
            }
        }
        this.updateAttributeValueFunc(elem, value, name, value, args);
    }

    public updateAttributeValueFunc(
        elem: Node,
        value: string,
        name?: string,
        originalValue?: string,
        ...args: any[]
    ): void {
        if (!(elem instanceof Element)) throw new Error("Node is not an element, cannot update element!");
        const element = elem as Element;
        const splits = (originalValue as string).split(regex);
        let attrValue = "";
        for (let i = 0; i < splits.length; i++) {
            if (i % 2 === 1) attrValue += this.getters.get(splits[i + 1])(args) as string;
            else attrValue += splits[i];
        }
        if (element.tagName === "input" && name === "checked")
            setProperty(element as HTMLInputElement, name, stringToBoolean(attrValue));
        else if (element.tagName === "input" && name === "value")
            setProperty(element as HTMLInputElement, name, attrValue);
        else if (element.tagName === "option" && name === "selected")
            setProperty(element as HTMLOptionElement, name, stringToBoolean(attrValue));
        else element.setAttribute(name, attrValue);
    }

    public hasDomNodeBinders(propPath: string): boolean {
        return this._bindingSetters.has(propPath);
    }

    public updateDomNodes(propPath: string, value: any): void {
        const binders = this._bindingSetters.get(propPath);
        if (binders === undefined) return;
        binders.forEach((binder) => {
            binder.setter(binder.node, value, binder.attributeName, binder.originalValue);
        });
    }
}
