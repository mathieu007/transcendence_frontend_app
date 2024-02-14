// Auto-generated file, do not edit!!!
import { Listeners } from "@explicit.js.mvc/listeners";
import type { ModalDefaultComponent } from "@component/modal/default";
import { Template, type TemplateNode } from "@explicit.js.mvc/template";
import { ModalDefaultModel } from "@model/modal/default";

export class ModalDefaultTemplate extends Template<ModalDefaultModel> {
    public generateTemplate(
        comp: ModalDefaultComponent,
        model: ModalDefaultModel,
        childContent: Element
    ): TemplateNode {
		model.contentVarName = "childContent";
		let rootElem_0 = document.createElement("div");
		rootElem_0.setAttribute("class", "modal-Modal");
		rootElem_0.setAttribute("role", "document");
		let rootElem_0_1 = document.createElement("div");
		rootElem_0_1.setAttribute("class", "modal-content rounded-4 shadow");
		let rootElem_0_1_1 = document.createElement("div");
		rootElem_0_1_1.setAttribute("class", "modal-header border-bottom-0");
		let rootElem_0_1_1_1 = document.createElement("h1");
		rootElem_0_1_1_1.setAttribute("class", "modal-title fs-5");
		model.setTextNode(rootElem_0_1_1_1, "");
		model.setVarTextNode(rootElem_0_1_1_1, "model.title");
		model.setTextNode(rootElem_0_1_1_1, "");
		rootElem_0_1_1.appendChild(rootElem_0_1_1_1);
		let rootElem_0_1_1_3 = document.createElement("button");
		rootElem_0_1_1_3.setAttribute("type", "button");
		rootElem_0_1_1_3.setAttribute("class", "btn-close");
		const clickListener_3_0 = () => { comp.close(); }
		Listeners.addClickListenerFunc(rootElem_0_1_1_3, "3_0", clickListener_3_0);
		rootElem_0_1_1_3.setAttribute("aria-label", "Close");
		rootElem_0_1_1.appendChild(rootElem_0_1_1_3);
		rootElem_0_1.appendChild(rootElem_0_1_1);
		let rootElem_0_1_3 = document.createElement("div");
		rootElem_0_1_3.setAttribute("class", "modal-body py-0");
		let rootElem_0_1_3_1 = document.createElement("p");
		model.setVarAttributeValue(rootElem_0_1_3_1, "class", "${model.class}");
		model.setTextNode(rootElem_0_1_3_1, "");
		model.setVarContentNode(rootElem_0_1_3_1, comp.content);
		model.setTextNode(rootElem_0_1_3_1, "");
		rootElem_0_1_3.appendChild(rootElem_0_1_3_1);
		let rootElem_0_1_3_3 = document.createElement("input");
		const inputListener_3_1 = () => { comp.event(); }
		Listeners.addInputListenerFunc(rootElem_0_1_3_3, "3_1", inputListener_3_1);
		rootElem_0_1_3_3.setAttribute("type", "input");
		rootElem_0_1_3_3.setAttribute("value", "123 test");
		rootElem_0_1_3.appendChild(rootElem_0_1_3_3);
		let rootElem_0_1_3_5 = document.createElement("input");
		const changeListener_3_2 = () => { comp.event(); }
		Listeners.addChangeListenerFunc(rootElem_0_1_3_5, "3_2", changeListener_3_2);
		rootElem_0_1_3_5.setAttribute("type", "checkbox");
		model.setVarAttributeValue(rootElem_0_1_3_5, "checked", "${model.is_opened}");
		rootElem_0_1_3.appendChild(rootElem_0_1_3_5);
		rootElem_0_1.appendChild(rootElem_0_1_3);
		let rootElem_0_1_5 = document.createElement("div");
		rootElem_0_1_5.setAttribute("class", "modal-footer flex-column align-items-stretch w-100 gap-2 pb-3 border-top-0");
		let rootElem_0_1_5_1 = document.createElement("button-component");
		const clickListener_3_3 = () => { comp.close(); }
		Listeners.addClickListenerFunc(rootElem_0_1_5_1, "3_3", clickListener_3_3);
		model.setTextNode(rootElem_0_1_5_1, "Close");
		rootElem_0_1_5.appendChild(rootElem_0_1_5_1);
		rootElem_0_1.appendChild(rootElem_0_1_5);
		rootElem_0.appendChild(rootElem_0_1);
		this.rootElement = rootElem_0;
		return this.rootElement;
}


}
