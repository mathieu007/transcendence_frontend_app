import type { LayoutTemplate } from "@explicit.js.mvc/layout.template";
import type { LayoutModel } from "@explicit.js.mvc/layout.model";
import type { BaseAppModel } from "@explicit.js.mvc/base.app.model";
import { Component } from "@explicit.js.mvc/component";

export abstract class Layout<TModel extends LayoutModel> extends Component<TModel> {
    private _app: BaseAppModel;
    constructor(app: BaseAppModel, model: TModel, template: LayoutTemplate<TModel>) {
        super(model, template);
        this._app = app;
    }
    get app(): BaseAppModel {
        return this._app;
    }

    public insertControllerNode(controllerNode: Element): void {
        let nextSibling = this._beforeInsertNode.nextSibling;
        if (nextSibling) {
            this._beforeInsertNode.parentNode.insertBefore(controllerNode, this._beforeInsertNode.nextSibling);
        }
    }
    public insertHeader(headerNode: Element): void {
        let nextSibling = this._beforeInsertNode.nextSibling;
        if (nextSibling) {
            this._beforeInsertNode.parentNode.insertBefore(headerNode, this._beforeInsertNode.nextSibling);
        }
    }
}
