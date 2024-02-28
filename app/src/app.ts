import { BaseApp } from "@explicit.js.mvc/base.app.container";
import { inject } from "@explicit.js.mvc/di/container";
import { AppModel } from "src/app.model";

// @injectionTarget()
export class App extends BaseApp {
    constructor(@inject("AppModel", AppModel) app: AppModel) {
        super(app);
    }
}
