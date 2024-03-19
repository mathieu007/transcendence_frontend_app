import { HomeController } from "@controller/home/home";
import { Router } from "@explicit.js.mvc/routing/router";
import { LoginController } from "@controller/login/login";
import { HomeController } from "@controller/game/home";
import { HomeController } from "@controller/game/game";

export class Routes {
    login: LoginController = Router.register("LoginController",LoginController);
    game: HomeController = Router.register("HomeController",HomeController);
    home: HomeController = Router.register("HomeController",HomeController);
}
