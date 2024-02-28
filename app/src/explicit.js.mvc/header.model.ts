import { DataBinding } from "@explicit.js.mvc/model.binding";
import { DomObservableModel } from "@explicit.js.mvc/observable";

export class MetaTag extends DomObservableModel {
    @DataBinding
    public typeName: string;
    @DataBinding
    public typeValue: string;
    @DataBinding
    public content: string;
}

export class HeaderModel extends DomObservableModel {
    @DataBinding
    public title: string;
    @DataBinding
    public description: string;
}
