import { Container } from "@explicit.js.mvc/di/container";
import { DataBinding } from "@explicit.js.mvc/model.binding";
import { DomObservableModel } from "@explicit.js.mvc/observable";

export interface IModalModel {
    is_opened: boolean;
    title: string;
    class: string;
}

export class ModalDefaultModel extends DomObservableModel {
    @DataBinding
    title: string = "";
    @DataBinding
    class: string = "";
    @DataBinding
    show_close: boolean = true;
    @DataBinding
    show_title: boolean = true;
    @DataBinding
    is_opened: boolean = false;
}

Container.register("ModalDefaultModel", ModalDefaultModel);
