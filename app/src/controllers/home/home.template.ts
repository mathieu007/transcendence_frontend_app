import { ModalDefaultComponent } from "@component/modal/default";
import { HomeController } from "@controller/home/home";
import { ControllerTemplate } from "@explicit.js.mvc/controller.template";
import { TemplateNode } from "@explicit.js.mvc/template";
import { HomeModel } from "@model/home/home";

export class HomeTemplate extends ControllerTemplate<HomeModel> {
    public modal: ModalDefaultComponent;
    public repeat_modal: Array<ModalDefaultComponent> = new Array<ModalDefaultComponent>();
    public generateTemplate(controller: HomeController, model: HomeModel): TemplateNode {
        return /*html*/ `<div id="header-title">
            <div class="bottom-to-half-fade-black">
                <div class="outter-banner">
                    <div class="container px-4 py-5 my-5"><div class="row">
                    <div class="banner-lg col-lg-9 banner-md banner-sm">
                        <h1 class="display-1">Pong 3d - Game</h1>
                        <p class="lead">
                            Welcome to our Pong 3d Game, this game is a multiplayer game and the communication
                            is done
                            with websocket,
                            The performance of the game have been optimized to support over 2000 balls.
                            Make sure your GPU acceleration is enabled in the browser...
                        </p>
                        <div class="row hgap-sm vgap-sm justify-content-center justify-content-sm-start">
                            <div class="col-auto">
                                <a class="btn btn-lg btn-white" type="button" role="button" href="#demo">
                                    <span>Sign-in</span>
                                </a>
                            </div>
                            <div class="col-auto">
                                <a type="button" role="button" class="btn btn-lg btn-primary" href="/play">
                                    <span class="name">Play Now</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>`;
    }
}
