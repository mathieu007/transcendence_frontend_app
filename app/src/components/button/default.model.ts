import { DataBinding } from "@explicit.js.mvc/model.binding";
import { DomObservableModel } from "@explicit.js.mvc/observable";

export class ButtonDefaultModel extends DomObservableModel {
    @DataBinding
    label: string;
}
