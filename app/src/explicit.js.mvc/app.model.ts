import { UserModel } from "@model/user";
import { DataBinding } from "@explicit.js.mvc/model.binding";
import { DomObservableModel } from "@explicit.js.mvc/observable";
import type { Layout } from "@explicit.js.mvc/layout";
import type { LayoutModel } from "@explicit.js.mvc/layout.model";
import type { Controller } from "@explicit.js.mvc/controller";
import { Container } from "@explicit.js.mvc/di/container";
import type { HomeController } from "@controller/home/home";

export class AppModel extends DomObservableModel {
    @DataBinding
    current_user: UserModel;
    @DataBinding
    is_authenticated: boolean = false;
    @DataBinding
    active_layout: Layout<LayoutModel>;
    @DataBinding
    active_controller: Controller<AppModel, Layout<LayoutModel>, DomObservableModel>;
}
Container.register(AppModel);