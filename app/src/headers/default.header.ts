import { inject } from "@explicit.js.mvc/di/container";
import { Header } from "@explicit.js.mvc/header";
import { AppModel } from "@model/app";
import { HeaderDefaultModel } from "@model/header/default";
import { HeaderDefaultTemplate } from "@template/header/default";

// @injectionTarget()
export class DefaultHeader extends Header<HeaderDefaultModel> {
    constructor(
        @inject("AppModel", AppModel) app: AppModel,
        @inject("HeaderDefaultModel", HeaderDefaultModel) model: HeaderDefaultModel,
        @inject("HeaderDefaultTemplate", HeaderDefaultTemplate) template: HeaderDefaultTemplate
    ) {
        super(app, model, template);
    }
}
