import type {
    ComponentTemplate,
    TemplateNode
} from "@explicit.js.mvc/template";
import type { Controller } from "@explicit.js.mvc/controller";
import type { DomObservableModel } from "@explicit.js.mvc/observable";
import type { LayoutModel } from "@explicit.js.mvc/layout.model";
import type { AppModel } from "@explicit.js.mvc/app.model";
import type { Layout } from "@explicit.js.mvc/layout";

export abstract class ControllerTemplate {
    private _templateElement: TemplateNode;
    constructor() {}
    public abstract generateTemplate(
        controller: Controller<
            AppModel,
            Layout<LayoutModel>,
            DomObservableModel
        >,
        layout?: Layout<LayoutModel>,
        model?: DomObservableModel
    ): TemplateNode;

    get template(): ComponentTemplate {
        return this._templateElement as ComponentTemplate;
    }
    set template(template: ComponentTemplate) {
        this._templateElement = template;
    }
}
