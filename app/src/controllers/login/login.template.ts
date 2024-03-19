import { ModalDefaultComponent } from "@component/modal/default";
import { LoginController } from "@controller/login/login";
import { ControllerTemplate } from "@explicit.js.mvc/controller.template";
import { TemplateNode } from "@explicit.js.mvc/template";
import { LoginModel } from "@model/login/login";

export class LoginTemplate extends ControllerTemplate<LoginModel> {
    public modal: ModalDefaultComponent;
    public repeat_modal: Array<ModalDefaultComponent> = new Array<ModalDefaultComponent>();
    public generateTemplate(controller: LoginController, model: LoginModel): TemplateNode {
        return /*html*/ `
        <div id="header-title">
            <div class="bottom-to-half-fade-black">
                <div class="inner-banner">
                    <div class="container px-4 py-5 my-5">
                        <div class="row justify-content-center">
                            <div class="col-12 col-md-8 col-lg-6 col-xl-5">
                                <div class="mpl-sign-form glowing-border">
                                    <h1>Sign In</h1>
                                    <form action="#">
                                        <div class="row hgap-xs vgap-sm align-items-center">
                                            <div class="col-12">
                                                <input class="form-control" type="text" id="signin_login" name="signin_login" placeholder="Login"><span
                                                    class="form-control-bg"></span>
                                            </div>
                                            <div class="col-12">
                                                <input class="form-control" type="password" id="signin_password"
                                                    name="signin_password" placeholder="Password"><span
                                                    class="form-control-bg"></span>
                                            </div>
                                            <div class="col" data-sr-item="sign">
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox"
                                                        id="signin_rememberme" name="signin_rememberme"><label
                                                        class="form-check-label" for="signin_rememberme">Remember Me</label>
                                                </div>
                                            </div>
                                            <div class="col-auto" data-sr-item="sign">
                                                <a href="#" class="small">Lost Password</a>
                                            </div>
                                            <div class="col-12" data-sr-item="sign">
                                                <button class="btn btn-md btn-lg btn-full btn-primary"><span>Sign In</span></button>
                                            </div>
                                            <div class="col-12" data-sr-item="sign">
                                                or </div>
                                            <div class="col" data-sr-item="sign">
                                                <a href="#" class="btn btn-md btn-block btn-facebook">
                                                    <svg class="icon icon-fill">
                                                        <path
                                                            d="M23.625 12C23.625 5.57812 18.4219 0.375 12 0.375C5.57812 0.375 0.375 5.57812 0.375 12C0.375 17.8022 4.62609 22.6116 10.1836 23.4844V15.3605H7.23047V12H10.1836V9.43875C10.1836 6.52547 11.918 4.91625 14.5744 4.91625C15.8466 4.91625 17.1769 5.14313 17.1769 5.14313V8.0025H15.7106C14.2669 8.0025 13.8164 8.89875 13.8164 9.81797V12H17.0405L16.5248 15.3605H13.8164V23.4844C19.3739 22.6116 23.625 17.8022 23.625 12Z">
                                                        </path>
                                                    </svg>
                                                </a>
                                            </div>
                                            <div class="col">
                                                <a href="#" class="btn btn-md btn-block btn-twitter">
                                                    <svg class="icon icon-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                        <path
                                                            d="M21.533 7.11166C21.5482 7.32485 21.5482 7.53808 21.5482 7.75127C21.5482 14.2538 16.599 21.7462 7.5533 21.7462C4.76648 21.7462 2.17767 20.939 0 19.5381C0.395953 19.5837 0.776625 19.599 1.18781 19.599C3.48727 19.599 5.60405 18.8223 7.29441 17.4975C5.13197 17.4518 3.31978 16.0355 2.69541 14.0863C3 14.1319 3.30455 14.1624 3.62437 14.1624C4.06598 14.1624 4.50764 14.1015 4.91878 13.9949C2.66498 13.538 0.974578 11.5584 0.974578 9.1675V9.10661C1.62937 9.4721 2.39086 9.70052 3.19791 9.73094C1.87303 8.84767 1.00505 7.34008 1.00505 5.63449C1.00505 4.7208 1.24866 3.88324 1.67508 3.15227C4.09641 6.13703 7.73602 8.08624 11.8172 8.29947C11.7411 7.93399 11.6954 7.55331 11.6954 7.1726C11.6954 4.46191 13.8883 2.25381 16.6141 2.25381C18.0304 2.25381 19.3095 2.84772 20.208 3.80711C21.3197 3.59392 22.3857 3.18274 23.3299 2.6193C22.9643 3.76146 22.1877 4.72085 21.1674 5.32994C22.1573 5.22339 23.1167 4.94922 23.9999 4.56855C23.33 5.54313 22.4924 6.41111 21.533 7.11166V7.11166Z">
                                                        </path>
                                                    </svg>
                                                </a>
                                            </div>
                                            <div class="col" data-sr-item="sign">
                                                <a href="#" class="btn btn-md btn-block btn-google-plus">
                                                    <svg class="icon icon-fill" fill="currentColor" viewBox="0 0 24 24"
                                                        xmlns="http://www.w3.org/2000/svg">
                                                        <path
                                                            d="M23 12.2719C23 18.9047 18.433 23.625 11.6885 23.625C5.22213 23.625 0 18.4312 0 12C0 5.56875 5.22213 0.375 11.6885 0.375C14.8369 0.375 17.4857 1.52344 19.5264 3.41719L16.3451 6.45938C12.1834 2.46563 4.44447 5.46563 4.44447 12C4.44447 16.0547 7.70123 19.3406 11.6885 19.3406C16.3168 19.3406 18.0512 16.0406 18.3246 14.3297H11.6885V10.3312H22.8162C22.9246 10.9266 23 11.4984 23 12.2719Z">
                                                        </path>
                                                    </svg>
                                                </a>
                                            </div>
                                            <div class="col-12" data-sr-item="sign"
                                                style="visibility: visible; opacity: 1;">
                                                Are you new? <a href="/sign-up">Sign Up</a>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        `;
    }
}
