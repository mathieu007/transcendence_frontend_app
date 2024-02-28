import type { BaseAppModel } from "@explicit.js.mvc/base.app.model";
import type { Layout } from "@explicit.js.mvc/layout";
import type { LayoutModel } from "@explicit.js.mvc/layout.model";
import type { DomObservableModel } from "@explicit.js.mvc/observable";
import { Template, type ComponentTemplate, type TemplateNode } from "@explicit.js.mvc/template";

export abstract class LayoutTemplate<TModel extends DomObservableModel> extends Template<TModel> {
    constructor() {
        super();
    }
}
