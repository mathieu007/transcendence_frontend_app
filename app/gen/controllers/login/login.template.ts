// Auto-generated file, do not edit!!!
import { Listeners } from "@explicit.js.mvc/listeners";
import { ModalDefaultComponent } from "@component/modal/default";
import { LoginController } from "@controller/login/login";
import { ControllerTemplate } from "@explicit.js.mvc/controller.template";
import { TemplateNode } from "@explicit.js.mvc/template";
import { LoginModel } from "@model/login/login";

export class LoginTemplate extends ControllerTemplate<LoginModel> {
    public modal: ModalDefaultComponent;
    public repeat_modal: Array<ModalDefaultComponent> = new Array<ModalDefaultComponent>();
    public generateTemplate(controller: LoginController): TemplateNode {
		let rootElem_0 = document.createElement("div");
		rootElem_0.setAttribute("id", "jarallax-container-0");
		rootElem_0.setAttribute("style", "position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; overflow: hidden; z-index: -100; clip-path: polygon(0px 0px, 100% 0px, 100% 100%, 0px 100%);");
		let rootElem_0_3 = document.createElement("img");
		rootElem_0_3.setAttribute("src", "/assets/img/space-planet.jpg");
		rootElem_0_3.setAttribute("alt", "");
		rootElem_0_3.setAttribute("class", "jarallax-img col-main-image");
		rootElem_0_3.setAttribute("style", "object-fit: cover; object-position: 50% 50%; max-width: none; position: absolute; top: 0px; left: 0px; width: 100%; height:100%; overflow: hidden; pointer-events: none; transform-style: preserve-3d; backface-visibility: hidden; margin-top: 0px; transform: translate3d(0px, 0px, 0px);");
		rootElem_0.appendChild(rootElem_0_3);
		this.rootElement = rootElem_0;
		return this.rootElement;
}


}
