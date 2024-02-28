import { Controller } from "@explicit.js.mvc/controller";
import { inject } from "@explicit.js.mvc/di/container";
import { LoginModel } from "@model/login/login";
import { DefaultLayout } from "@layout/default";
import { Route } from "@explicit.js.mvc/routing/router";
import { LoginTemplate } from "@template/login/login";
import { App } from "@app";
import { DefaultHeader } from "@header/default";

// @injectionTarget()
export class LoginController extends Controller<App, DefaultHeader, DefaultLayout, LoginModel> {
    constructor(
        @inject("App", App) app: App,
        @inject("DefaultHeader", DefaultHeader) header: DefaultHeader,
        @inject("DefaultLayout", DefaultLayout) layout: DefaultLayout,
        @inject("LoginModel", LoginModel) model: LoginModel,
        @inject("LoginTemplate", LoginTemplate) template: LoginTemplate
    ) {
        super(app, header, layout, model, template);
    }
    // @Route("/login")
    // public login(): void {
    //     console.log("LoginController.login()");
    // }
}
