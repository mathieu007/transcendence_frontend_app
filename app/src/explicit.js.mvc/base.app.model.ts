import { UserModel } from "@model/user";
import { DataBinding } from "@explicit.js.mvc/model.binding";
import { DomObservableModel } from "@explicit.js.mvc/observable";
import type { Layout } from "@explicit.js.mvc/layout";
import type { LayoutModel } from "@explicit.js.mvc/layout.model";
import type { Controller } from "@explicit.js.mvc/controller";
import type { BaseApp } from "@explicit.js.mvc/base.app.container";
import type { Header } from "@explicit.js.mvc/header";
import type { HeaderModel } from "@explicit.js.mvc/header.model";

export class BaseAppModel extends DomObservableModel {
    @DataBinding
    current_user: UserModel;
    @DataBinding
    is_authenticated: boolean = false;
    @DataBinding
    active_layout: Layout<LayoutModel> | undefined;
    @DataBinding
    active_header: Header<HeaderModel> | undefined;
    @DataBinding
    active_controller: Controller<BaseApp, Header<HeaderModel>, Layout<LayoutModel>, DomObservableModel>;
}
