// Auto-generated file, do not edit!!!
import { Listeners } from "@explicit.js.mvc/listeners";
import { HeaderTemplate } from "@explicit.js.mvc/header.template";
import type { TemplateNode } from "@explicit.js.mvc/template";
import type { DefaultHeader } from "@header/default";
import type { HeaderDefaultModel } from "@model/header/default";

export class HeaderDefaultTemplate extends HeaderTemplate<HeaderDefaultModel> {
    public generateTemplate(header: DefaultHeader, model: HeaderDefaultModel): TemplateNode {
		model.contentVarName = "";
		let rootElem_0 = document.createElement("head");
		let rootElem_0_1 = document.createElement("meta");
		rootElem_0_1.setAttribute("charset", "UTF-8");
		rootElem_0.appendChild(rootElem_0_1);
		let rootElem_0_3 = document.createElement("link");
		rootElem_0_3.setAttribute("rel", "icon");
		rootElem_0_3.setAttribute("type", "image/svg+xml");
		rootElem_0_3.setAttribute("href", "/vite.svg");
		rootElem_0.appendChild(rootElem_0_3);
		let rootElem_0_5 = document.createElement("meta");
		rootElem_0_5.setAttribute("name", "viewport");
		rootElem_0_5.setAttribute("content", "width=device-width, initial-scale=1.0");
		rootElem_0.appendChild(rootElem_0_5);
		let rootElem_0_7 = document.createElement("title");
		rootElem_0.appendChild(rootElem_0_7);
		model.appendTextNode(rootElem_0_7, "");
		model.addTextNodeCallback(rootElem_0_7, "model.title");
		model.appendTextNode(rootElem_0_7, "");
		this.rootElement = rootElem_0;
		return this.rootElement;
}


}
