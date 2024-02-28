import { DataBinding } from "@explicit.js.mvc/model.binding";
import { ModalDefaultModel } from "@model/modal/default";
import { TopMenuModel } from "@model/menu/top.menu";
import { DomObservableModel } from "@explicit.js.mvc/observable";

export class LayoutDefaultModel extends DomObservableModel {
    constructor() {
        super();
    }
    @DataBinding
    top_menu: Array<TopMenuModel>;
    @DataBinding
    error_modal: ModalDefaultModel;
}
