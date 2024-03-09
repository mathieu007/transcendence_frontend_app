import { ModalDefaultComponent } from "@component/modal/default";
import { HomeController } from "@controller/home/home";
import { ControllerTemplate } from "@explicit.js.mvc/controller.template";
import { TemplateNode } from "@explicit.js.mvc/template";
import { HomeModel } from "@model/home/home";

export class HomeTemplate extends ControllerTemplate<HomeModel> {
    public modal: ModalDefaultComponent;
    public repeat_modal: Array<ModalDefaultComponent> = new Array<ModalDefaultComponent>();
    public generateTemplate(controller: HomeController): TemplateNode {
        return /*html*/ `
            <div id="header-title">
                <!-- <div style="position:absolute;">123</div> -->
            </div>
            <!-- <component assign="${this.modal}"></component> -->         
        `;
    }
}
