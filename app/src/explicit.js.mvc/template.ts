import type { Layout } from "@explicit.js.mvc/layout";
import { Component } from "./component";
import { DomObservableModel } from "./observable";
import type { LayoutModel } from "@explicit.js.mvc/layout.model";

export function rawTemplate(strings: TemplateStringsArray, ...values: unknown[]): string {
    return strings.reduce((result, string, i) => {
        return result + string + (i < values.length ? `\${${values[i]}}` : "");
    }, "");
}

export function rawTemplateWithPlaceHolder(
    strings: TemplateStringsArray,
    placeholder: string,
    ...values: unknown[]
): string {
    return strings.reduce((result, string, i) => {
        if (i <= 9)
            return result + string + (i < values.length ? `<span class="neutral-span">${placeholder}0${i}</span>` : "");
        else return result + string + (i < values.length ? `<span class="neutral-span">${placeholder}${i}</span>` : "");
    }, "");
}

function getNestedValue(obj: any, path: string): any {
    const pathArray = path.split(/\.|\[|\].?/).filter((p) => p.length > 0);
    return pathArray.reduce((current, key) => current?.[key], obj);
}

export function fillTemplate(template: string, variables: { [key: string]: unknown }): string {
    // eslint-disable-next-line no-useless-escape
    return template.replace(/\$\{([\w.\[\]]+)\}/g, (match, path) => {
        const value = getNestedValue(variables, path);
        return value !== undefined ? value : match;
    });
}

export function splitTemplate(template: string): string[] {
    const regex = /(\$\{[^}]+\})/;
    return template.split(regex).filter((part) => part !== "");
}

export class RootElement extends Element {
    constructor() {
        super();
    }
    public append(element: Element) {
        this.appendChild(element);
    }
    public appendTemplate(root: RootElement) {
        let elements = root.getElements();
        for (let i = 0; i < elements.length; i++) {
            this.appendChild(elements[i]);
        }
    }
    public getElements(): HTMLCollection {
        return this.children;
    }
}

export interface ComponentTemplate extends RootElement {
    is_component?: boolean;
}

export type TemplateNode = ComponentTemplate | string;

class TemplateBlock {
    constructor(createTemplateFunc: (...args: any[]) => TemplateNode) {
        this._index = 0;
        this.createTemplateFunc = createTemplateFunc;
        this.templates = [];
    }
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
    private _index: number;
    private _args: Array<any[]> = new Array<any[]>();
    public parentElement: Element;
    // a single template can be repeated multiple times so we can create many instances of the same template.
    public templates: Array<TemplateNode>;
    // a simple lambda function that is used to create an instance of the template.
    public createTemplateFunc: (...args: any[]) => TemplateNode;
    // a function that add an instance of the template to the array by the number of occurences/repetitions or get simply get it.
    public getInstance(...args: any[]): TemplateNode {
        const index = this._index;
        if (this.templates.length <= index) {
            this._args.push(args);
            this.templates.push(this.createTemplateFunc(args));
            this._index++;
        }
        if (!this._argsAreEqual(this._args[index], args)) {
            this._args[index] = args;
            this.templates[index] = this.createTemplateFunc(args);
        }
        return this.templates[index];
    }
    public reset(): void {
        this._index = 0;
    }
}

export abstract class Template<TModel extends DomObservableModel> {
    protected _rootTemplateElement: ComponentTemplate;
    private _templates: Array<TemplateBlock>;

    constructor() {
        this._templates = new Array();
    }
    public abstract generateTemplate(
        comp: Component<TModel>,
        model: TModel,
        content?: Element,
        layout?: Layout<LayoutModel>
    ): TemplateNode;

    public resetCounters(): void {}

    public getTemplate(index: number, ...args: any[]): TemplateNode {
        return this._templates[index].getInstance(args);
    }

    public createTemplate(index: number, templateFunc: (...args: any[]) => TemplateNode): void {
        while (this._templates.length <= index) {
            this._templates.push(new TemplateBlock(templateFunc));
        }
        this._templates[index] = new TemplateBlock(templateFunc);
    }

    get rootElement(): ComponentTemplate {
        if (this._rootTemplateElement) return this._rootTemplateElement as ComponentTemplate;
    }

    set rootElement(template: Element) {
        if (!this._rootTemplateElement) this._rootTemplateElement = new RootElement();
        this._rootTemplateElement.append(template);
        this._rootTemplateElement.is_component = true;
    }
}
