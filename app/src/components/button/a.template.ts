import { ButtonDefaultComponent } from "@component/button/default";
import {
    Template,
    type ComponentTemplate,
    type TemplateNode
} from "@explicit.js.mvc/template";
import { ButtonDefaultModel } from "@model/button/default";

export class ButtonATemplate extends Template<ButtonDefaultModel> {
    public generateTemplate(
        comp: ButtonDefaultComponent,
        model: ButtonDefaultModel | undefined,
        content: Element
    ): TemplateNode {
        return /*html*/ `
		<!-- Your html here... -->
        <a href="#" role="button" class="btn">${content}</a>
        `;
    }
}
