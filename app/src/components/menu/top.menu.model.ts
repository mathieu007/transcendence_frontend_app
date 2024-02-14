import { DomObservableModel } from "@explicit.js.mvc/observable";

export class TopMenuModel extends DomObservableModel {
    title: string = "";
    link: string = "";
    icon: string = "";
    active: boolean = false;
    class: string = "";
    sub_menu: Array<TopMenuModel> | undefined = undefined;
    data: object | undefined;
}
