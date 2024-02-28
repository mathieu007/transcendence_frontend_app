import type { HeaderModel } from "@explicit.js.mvc/header.model";
import type { BaseAppModel } from "@explicit.js.mvc/base.app.model";
import { Component } from "@explicit.js.mvc/component";
import type { HeaderTemplate } from "@explicit.js.mvc/header.template";

export abstract class Header<TModel extends HeaderModel> extends Component<TModel> {
    private _app: BaseAppModel;
    constructor(app: BaseAppModel, model: TModel, template: HeaderTemplate<TModel>) {
        super(model, template);
        this._app = app;
    }
    get app(): BaseAppModel {
        return this._app;
    }
}
