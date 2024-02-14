// Auto-generated file, do not edit!!!
import { Listeners } from "@explicit.js.mvc/listeners";
import type { HomeController } from "@controller/home/home";
import { ControllerTemplate } from "@explicit.js.mvc/controller.template";
import type { TemplateNode } from "@explicit.js.mvc/template";

export class HomeTemplate extends ControllerTemplate {
    public generateTemplate(controller: HomeController): TemplateNode {
		let rootElem_0 = document.createElement("div");
		rootElem_0.setAttribute("class", "px-4 py-5 my-5 col-md-12 text-center main-image");
		let rootElem_0_1 = document.createElement("div");
		rootElem_0_1.setAttribute("id", "jarallax-container-0");
		rootElem_0_1.setAttribute("style", "position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; overflow: hidden; z-index: -100; clip-path: polygon(0px 0px, 100% 0px, 100% 100%, 0px 100%);");
		let rootElem_0_1_1 = document.createElement("img");
		rootElem_0_1_1.setAttribute("src", "/assets/img/space-planet.jpg");
		rootElem_0_1_1.setAttribute("alt", "");
		rootElem_0_1_1.setAttribute("class", "jarallax-img col-main-image");
		rootElem_0_1_1.setAttribute("style", "object-fit: cover; object-position: 50% 50%; max-width: none; position: absolute; top: 0px; left: 0px; width: 100%; overflow: hidden; pointer-events: none; transform-style: preserve-3d; backface-visibility: hidden; margin-top: 0px; transform: translate3d(0px, 0px, 0px);");
		rootElem_0_1.appendChild(rootElem_0_1_1);
		rootElem_0.appendChild(rootElem_0_1);
		this.rootElement = rootElem_0;
		return this.rootElement;
}


}
