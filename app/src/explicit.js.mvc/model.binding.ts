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
    constructor(node: Node, setters: (elem: Node, value: any, name?: string) => void, attributeName?: string) {
        this.node = node;
        this.setter = setters;
        this.attributeName = attributeName;
    }
    public node: Node;
    public attributeName: string;
    public setter: (elem: Node, value: any, name?: string) => void;
}

export abstract class DomNodeModelBinding {
    static includedProperties: Map<string, Array<string>> = new Map();
    private _contentVarName: string;
    constructor() {}
    private _bindingSetters: Map<string, Array<DomNodeBindSetter>> = new Map<string, Array<DomNodeBindSetter>>();

    public setBinding(
        node: Node,
        propPath: string,
        func: (elem: Node, value: any, name?: string) => void,
        attrName?: string
    ): void {
        let binders = this._bindingSetters.get(propPath);
        if (binders === undefined) {
            binders = new Array<DomNodeBindSetter>();
            this._bindingSetters.set(propPath, binders);
        }
        binders.push(new DomNodeBindSetter(node, func, attrName));
    }

    public getPropVal(path: string): any {
        const index = path.indexOf(".");
        if (index !== -1) return getObjValFromPath(this, path.substring(index + 1));
        throw new Error(`Properties path ${path} is invalid.`);
    }

    set contentVarName(contentName: string) {
        this._contentVarName = contentName;
    }

    // we do not need a content update function, no need binding function
    public appendVarContentNode(elem: Node, content: Element): void {
        elem.appendChild(content);
    }

    public appendTextNode(elem: Node, value: string): void {
        const textNode = new Text(value);
        elem.appendChild(textNode);
    }

    public addTextNodeCallback(elem: Node, varPath: string): void {
        const val = this.getPropVal(varPath) as string;
        const textNode = new Text(val);
        elem.appendChild(textNode);
        this.setBinding(textNode, varPath, this.updateTextNodeFunc);
    }

    public updateTextNodeFunc(elem: Node, varPath: string, value?: string): void {
        if (!(elem instanceof Text)) throw new Error("Node is not a text node, cannot update content!");
        elem.textContent = this.getPropVal(varPath) as string;
    }

    public addAttributeCallback(elem: Node, name: string, value: string): void {
        this.updateAttributeValueFunc(elem, value, name);
        this.setBinding(elem, value, this.updateAttributeValueFunc, name);
    }

    public updateAttributeValueFunc(elem: Node, value: string, name?: string): void {
        if (!(elem instanceof Element)) throw new Error("Node is not an element, cannot update element!");
        const element = elem as Element;
        const splits = (value as string).split(regex);
        let attrValue = "";
        for (let i = 0; i < splits.length; i++) {
            if (i % 2 === 1) attrValue += this.getPropVal(splits[i]) as string;
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
            binder.setter(binder.node, value, binder.attributeName);
        });
    }
}
