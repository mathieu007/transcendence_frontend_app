import { HomeController } from "@controller/home/home";
import { Router } from "@explicit.js.mvc/routing/router";
import { LoginController } from "@controller/login/login";

export class Routes {
    home: HomeController = Router.register("HomeController", HomeController);
    login: LoginController = Router.register("LoginController",LoginController);
}
