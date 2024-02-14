import { DataBinding } from "@explicit.js.mvc/model.binding";
import { ModalDefaultModel } from "@model/modal/default";
import { TopMenuModel } from "@model/menu/top.menu";
import {
    Container,
    inject,
    injectionTarget
} from "@explicit.js.mvc/di/container";
import { LayoutModel } from "@explicit.js.mvc/layout.model";

@injectionTarget()
export class LayoutDefaultModel extends LayoutModel {
    constructor(
        @inject("ModalDefaultModel") error_modal: ModalDefaultModel,
        @inject("Array<TopMenuModel>") top_menu: Array<TopMenuModel>
    ) {
        super();
        this.error_modal = error_modal;
        this.top_menu = top_menu;
    }
    @DataBinding
    top_menu: Array<TopMenuModel>;
    @DataBinding
    error_modal: ModalDefaultModel;
}

Container.register("LayoutDefaultModel", LayoutDefaultModel);
Container.registerFactory("Array<TopMenuModel>", () => {
    return new Array<TopMenuModel>();
});
