import { Component } from "./component";
import { DomNodeModelBinding } from "./model.binding";
import { Observable, type DomObservableModel } from "./observable";

export function rawTemplate(
    strings: TemplateStringsArray,
    ...values: unknown[]
): string {
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
            return (
                result +
                string +
                (i < values.length
                    ? `<span class="neutral-span">${placeholder}0${i}</span>`
                    : "")
            );
        else
            return (
                result +
                string +
                (i < values.length
                    ? `<span class="neutral-span">${placeholder}${i}</span>`
                    : "")
            );
    }, "");
}

function getNestedValue(obj: any, path: string): any {
    const pathArray = path.split(/\.|\[|\].?/).filter((p) => p.length > 0);
    return pathArray.reduce((current, key) => current?.[key], obj);
}

export function fillTemplate(
    template: string,
    variables: { [key: string]: unknown }
): string {
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

export class AppendElement extends Element {
    private _elements: Array<Element | string> = new Array<Element | string>();
    public append(element: Element | string) {
        this._elements.push(element);
    }
}

export interface ComponentTemplate extends AppendElement {
    is_component?: boolean;
}

export type TemplateNode = ComponentTemplate | string;

export abstract class Template<TModel extends DomObservableModel> {
    private _templateElement: TemplateNode;
    constructor() {}

    public abstract generateTemplate(
        comp: Component<TModel>,
        model: DomObservableModel,
        content?: Element
    ): TemplateNode;

    get rootElement(): ComponentTemplate {
        return this._templateElement as ComponentTemplate;
    }

    set rootElement(template: Element) {
        this._templateElement = template as ComponentTemplate;
        this._templateElement.is_component = true;
    }

}
