import { ModalDefaultComponent } from "@component/modal/default";
import { LoginController } from "@controller/login/login";
import { ControllerTemplate } from "@explicit.js.mvc/controller.template";
import { TemplateNode } from "@explicit.js.mvc/template";
import { LoginModel } from "@model/login/login";

export class LoginTemplate extends ControllerTemplate<LoginModel> {
    public modal: ModalDefaultComponent;
    public repeat_modal: Array<ModalDefaultComponent> = new Array<ModalDefaultComponent>();
    public generateTemplate(controller: LoginController): TemplateNode {
        return /*html*/ `

                <div id="jarallax-container-0"
                    style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; overflow: hidden; z-index: -100; clip-path: polygon(0px 0px, 100% 0px, 100% 100%, 0px 100%);">
                <!-- <div class="d-flex justify-content-center align-items-center centered-image-container">
                    <img src="/assets/img/space-planet.jpg" alt="" class="img-fluid" alt="Responsive image" id="centered-image"> -->
                    <img src="/assets/img/space-planet.jpg" alt="" class="jarallax-img col-main-image"
                        style="object-fit: cover; object-position: 50% 50%; max-width: none; position: absolute; top: 0px; left: 0px; width: 100%; height:100%; overflow: hidden; pointer-events: none; transform-style: preserve-3d; backface-visibility: hidden; margin-top: 0px; transform: translate3d(0px, 0px, 0px);">
                </div>
                <!-- <component assign="${this.modal}"></component> -->
         
        `;
    }
}
