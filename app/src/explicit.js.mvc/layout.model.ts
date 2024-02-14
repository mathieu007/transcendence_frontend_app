import { DataBinding } from "@explicit.js.mvc/model.binding";
import { DomObservableModel } from "@explicit.js.mvc/observable";

export class LayoutModel extends DomObservableModel {
    @DataBinding
    public title: string;
}
