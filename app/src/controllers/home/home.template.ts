import type { HomeController } from "@controller/home/home";
import { ControllerTemplate } from "@explicit.js.mvc/controller.template";
import type { TemplateNode } from "@explicit.js.mvc/template";

export class HomeTemplate extends ControllerTemplate {
    public generateTemplate(controller: HomeController): TemplateNode {
        let layout = controller.layout;
        let model = controller.model;
        return /*html*/ `
        <div class="px-4 py-5 my-5 col-md-12 text-center main-image">
        	<div id="jarallax-container-0"
        		style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; overflow: hidden; z-index: -100; clip-path: polygon(0px 0px, 100% 0px, 100% 100%, 0px 100%);">
				<img src="/assets/img/space-planet.jpg" alt=""
        			class="jarallax-img col-main-image"
        			style="object-fit: cover; object-position: 50% 50%; max-width: none; position: absolute; top: 0px; left: 0px; width: 100%; overflow: hidden; pointer-events: none; transform-style: preserve-3d; backface-visibility: hidden; margin-top: 0px; transform: translate3d(0px, 0px, 0px);">
        	</div>
        </div>
        `;
    }
}
