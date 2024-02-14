import { ButtonDefaultComponent } from "@component/button/default";
import { Template, type TemplateNode } from "@explicit.js.mvc/template";
import { ButtonDefaultModel } from "@model/button/default";

export class ButtonDefaultTemplate extends Template<ButtonDefaultModel> {
    public generateTemplate(
        comp: ButtonDefaultComponent,
        model: ButtonDefaultModel | undefined,
        content: Element
    ): TemplateNode {
        return /*html*/ `
        <button type="button" class="btn">${content}</button>
        `;
    }
}
