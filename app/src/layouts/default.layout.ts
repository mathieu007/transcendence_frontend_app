import { BaseAppModel } from "@explicit.js.mvc/base.app.model";
import { inject, injectionTarget } from "@explicit.js.mvc/di/container";
import { Layout } from "@explicit.js.mvc/layout";
import { AppModel } from "@model/app";
import { LayoutDefaultModel } from "@model/layout/default";
import { LayoutDefaultTemplate } from "@template/layout/default";

// @injectionTarget()
export class DefaultLayout extends Layout<LayoutDefaultModel> {
    constructor(
        @inject("AppModel", AppModel) app: AppModel,
        @inject("LayoutDefaultModel", LayoutDefaultModel) model: LayoutDefaultModel,
        @inject("LayoutDefaultTemplate", LayoutDefaultTemplate) template: LayoutDefaultTemplate
    ) {
        super(app, model, template);
    }
}
