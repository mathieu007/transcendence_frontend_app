import { Template, type ComponentTemplate, type TemplateNode } from "@explicit.js.mvc/template";
import type { DomObservableModel } from "@explicit.js.mvc/observable";
import type { Layout } from "@explicit.js.mvc/layout";
import type { Component } from "@explicit.js.mvc/component";
import type { LayoutModel } from "@explicit.js.mvc/layout.model";

export abstract class ControllerTemplate<TModel extends DomObservableModel> extends Template<TModel> {
    constructor() {
        super();
    }

    public abstract generateTemplate(
        comp: Component<TModel>,
        model: TModel,
        content?: Element,
        layout?: Layout<LayoutModel>
    ): TemplateNode;

    get rootElement(): ComponentTemplate {
        return this._templateElement as ComponentTemplate;
    }

    set rootElement(template: Element) {
        this._templateElement = template as ComponentTemplate;
        this._templateElement.is_component = true;
    }
}
