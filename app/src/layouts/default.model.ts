import { DataBinding } from "@explicit.js.mvc/model.binding";
import { ModalDefaultModel } from "@model/modal/default";
import { TopMenuModel } from "@model/menu/top.menu";
import { DomObservableModel } from "@explicit.js.mvc/observable";

export class LayoutDefaultModel extends DomObservableModel {
    constructor() {
        super();
    }
    @DataBinding
    logo: string = "/assets/img/logo.png";
    @DataBinding
    top_menu: Array<TopMenuModel>;
    @DataBinding
    error_modal: ModalDefaultModel;
    @DataBinding
    mobile_menu: string = "hidden";
    @DataBinding
    main_menu: string = "visible";
}
