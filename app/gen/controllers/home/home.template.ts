// Auto-generated file, do not edit!!!
import { Listeners } from "@explicit.js.mvc/listeners";
import { ModalDefaultComponent } from "@component/modal/default";
import { HomeController } from "@controller/home/home";
import { ControllerTemplate } from "@explicit.js.mvc/controller.template";
import { TemplateNode } from "@explicit.js.mvc/template";
import { HomeModel } from "@model/home/home";

export class HomeTemplate extends ControllerTemplate<HomeModel> {
    public modal: ModalDefaultComponent;
    public repeat_modal: Array<ModalDefaultComponent> = new Array<ModalDefaultComponent>();
    public generateTemplate(controller: HomeController): TemplateNode {
		let rootElem_0 = document.createElement("div");
		rootElem_0.setAttribute("id", "header-title");
		this.rootElement = rootElem_0;
		return this.rootElement;
}


}
