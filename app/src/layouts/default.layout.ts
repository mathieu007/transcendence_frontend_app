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
        // const n = 100;
        // window.addEventListener("scroll", () => {
        //     if (window.scrollY >= n) {
        //         this._model.data.main_menu = "hidden";
        //     } else {
        //         this._model.data.main_menu = "visible";
        //     }
        // });
    }

    public mobile_toggle_menu() {
        if (this._model.mobile_menu === "visible") {
            this._model.data.mobile_menu = "hidden";
            this._model.data.main_menu = "visible";
        } else {
            this._model.data.mobile_menu = "visible";
            this._model.data.main_menu = "hidden";
        }
    }
}
