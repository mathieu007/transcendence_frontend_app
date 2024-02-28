import type { BaseAppModel } from "@explicit.js.mvc/base.app.model";
import { Routes } from "@explicit.js.mvc/routing/routes";

export class BaseApp {
    // public abstract RegisterContainers(): void;
    // public abstract RegisterControllers(): void;
    public static routes: Routes;
    private _model: BaseAppModel;
    private _header: Element;
    constructor(model: BaseAppModel) {
        this._model = model;
        this._header = document.head;
    }
    get model(): BaseAppModel {
        return this._model;
    }
    get globalHeader(): Element {
        return this._header;
    }
    public init() {
        // this.RegisterContainers();
        // this.RegisterControllers();
    }
}
