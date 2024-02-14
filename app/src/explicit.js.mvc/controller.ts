import type { LayoutModel } from "@explicit.js.mvc/layout.model";
import type { AppModel } from "@explicit.js.mvc/app.model";
import type { DomObservableModel } from "@explicit.js.mvc/observable";
import type { Layout } from "@explicit.js.mvc/layout";


export abstract class Controller<
    TAppModel extends AppModel,
    TLayout extends Layout<LayoutModel>,
    TControllerModel extends DomObservableModel
> {
    protected _app: TAppModel;
    protected _layout: TLayout;
    protected _model: TControllerModel | undefined;

    constructor(app: TAppModel, layout: TLayout, model?: TControllerModel) {
        this._app = app;
        this._layout = layout;
        this._model = model;
        this.app.active_controller = this;
    }
    get app(): TAppModel {
        return this._app;
    }
    get layout(): TLayout {
        return this._layout;
    }
    set layout(layout: TLayout) {
        this._layout = layout;
    }
    get model(): TControllerModel | undefined {
        return this._model;
    }
}
