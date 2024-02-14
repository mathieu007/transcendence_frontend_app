// Auto-generated file, do not edit!!!
import { Listeners } from "@explicit.js.mvc/listeners";
import { ButtonDefaultComponent } from "@component/button/default";
import { Template, type TemplateNode } from "@explicit.js.mvc/template";
import { ButtonDefaultModel } from "@model/button/default";

export class ButtonDefaultTemplate extends Template<ButtonDefaultModel> {
    public generateTemplate(
        comp: ButtonDefaultComponent,
        model: ButtonDefaultModel | undefined,
        content: Element
    ): TemplateNode {
		model.contentVarName = "content";
		let rootElem_0 = document.createElement("button");
		rootElem_0.setAttribute("type", "button");
		rootElem_0.setAttribute("class", "btn");
		model.setTextNode(rootElem_0, "");
		model.setVarContentNode(rootElem_0, comp.content);
		model.setTextNode(rootElem_0, "");
		this.rootElement = rootElem_0;
		return this.rootElement;
}


}
