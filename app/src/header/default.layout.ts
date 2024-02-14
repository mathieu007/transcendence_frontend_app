import type { AppModel } from "@explicit.js.mvc/app.model";
import {
    Container,
    inject,
    injectionTarget
} from "@explicit.js.mvc/di/container";
import { Layout } from "@explicit.js.mvc/layout";
import type { LayoutDefaultModel } from "@model/layouts/default";
import type { LayoutDefaultTemplate } from "@template/layouts/default";

@injectionTarget()
export class DefaultLayout extends Layout<LayoutDefaultModel> {
    constructor(
        @inject("AppModel") app: AppModel,
        @inject("LayoutDefaultModel") model: LayoutDefaultModel,
        @inject("LayoutDefaultTemplate") template: LayoutDefaultTemplate
    ) {
        super(model, template);
    }
}

Container.register("DefaultLayout", DefaultLayout);
