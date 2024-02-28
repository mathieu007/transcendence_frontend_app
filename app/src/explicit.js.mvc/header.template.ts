import type { DomObservableModel } from "@explicit.js.mvc/observable";
import { Template } from "@explicit.js.mvc/template";

export abstract class HeaderTemplate<TModel extends DomObservableModel> extends Template<TModel> {
    constructor() {
        super();
    }
}
