import { ButtonDefaultComponent } from "@component/button/default";
import { Template, type TemplateNode } from "@explicit.js.mvc/template";
import { ButtonDefaultModel } from "@model/button/default";

export class ButtonInputTemplate extends Template<ButtonDefaultModel> {
    public generateTemplate(
        comp: ButtonDefaultComponent,
        model: ButtonDefaultModel | undefined,
        content: Element
    ): TemplateNode {
        return /*html*/ `
        <input type="button" class="btn" value="Default" />
        `;
    }
}
