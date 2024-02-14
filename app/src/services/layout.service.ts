import type { AppModel } from "@explicit.js.mvc/app.model";
import {
    Container,
    inject,
    injectionTarget
} from "@explicit.js.mvc/di/container";
import type { Layout } from "@explicit.js.mvc/layout";
import { LayoutModel } from "@explicit.js.mvc/layout.model";

@injectionTarget()
export class LayoutService {
    private _appModel: AppModel;
    constructor(@inject("AppModel") appModel: AppModel) {
        this._appModel = appModel;
    }

    public setLayout(layout: Layout<LayoutModel>) {
        if (this._appModel.active_layout === layout) return;
        this._appModel.active_layout = layout;
        layout.template.generateTemplate(layout, layout.model);
    }
}

Container.register("LayoutService", LayoutService);
