import type { AppModel } from "@explicit.js.mvc/app.model";
import type { Layout } from "@explicit.js.mvc/layout";
import type { LayoutModel } from "@explicit.js.mvc/layout.model";
import type {
    ComponentTemplate,
    TemplateNode
} from "@explicit.js.mvc/template";

export abstract class LayoutTemplate<TModel extends LayoutModel> {
    private _templateElement: TemplateNode;
    constructor() {}

    public abstract generateTemplate(
        comp: Layout<TModel>,
        model: LayoutModel
    ): TemplateNode;

    get rootElement(): ComponentTemplate {
        return this._templateElement as ComponentTemplate;
    }

    set rootElement(template: Element) {
        this._templateElement = template as ComponentTemplate;
        this._templateElement.is_component = true;
    }
}
