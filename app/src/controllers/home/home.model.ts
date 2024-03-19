import { DataBinding } from "@explicit.js.mvc/model.binding";
import { DomObservableModel } from "@explicit.js.mvc/observable";

export class HomeModel extends DomObservableModel {
    @DataBinding
    public header: string = "";
}
