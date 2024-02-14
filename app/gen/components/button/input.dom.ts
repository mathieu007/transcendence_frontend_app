// Auto-generated file, do not edit!!!
import { Listeners } from "@explicit.js.mvc/listeners";
import { ButtonDefaultComponent } from "@component/button/default";
import { Template, type TemplateNode } from "@explicit.js.mvc/template";
import { ButtonDefaultModel } from "@model/button/default";

export class ButtonInputTemplate extends Template<ButtonDefaultModel> {
    public generateTemplate(
        comp: ButtonDefaultComponent,
        model: ButtonDefaultModel | undefined,
        content: Element
    ): TemplateNode {
		model.contentVarName = "content";
		let rootElem_0 = document.createElement("input");
		rootElem_0.setAttribute("type", "button");
		rootElem_0.setAttribute("class", "btn");
		rootElem_0.setAttribute("value", "Default");
		this.rootElement = rootElem_0;
		return this.rootElement;
}


}
