import type { LayoutModel } from "@explicit.js.mvc/layout.model";
import type { DomObservableModel } from "@explicit.js.mvc/observable";
import type { Layout } from "@explicit.js.mvc/layout";
import { Component } from "@explicit.js.mvc/component";
import type { Template } from "@explicit.js.mvc/template";
import type { BaseApp } from "@explicit.js.mvc/base.app.container";
import type { Header } from "@explicit.js.mvc/header";
import type { HeaderModel } from "@explicit.js.mvc/header.model";

export abstract class Controller<
    TApp extends BaseApp,
    THeader extends Header<HeaderModel>,
    TLayout extends Layout<LayoutModel>,
    TControllerModel extends DomObservableModel
> extends Component<TControllerModel> {
    protected _app: TApp;
    protected _layout: TLayout;
    protected _header: THeader;

    constructor(
        app: TApp,
        header: THeader,
        layout: TLayout,
        model: TControllerModel,
        template: Template<TControllerModel>
    ) {
        super(model, template);
        this._app = app;
        this._layout = layout;
        this._header = header;
    }
    get app(): TApp {
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
    get header(): THeader | undefined {
        return this._header;
    }
}
