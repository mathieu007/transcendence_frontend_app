import { Container } from "@explicit.js.mvc/di/container";
import { DomObservableModel } from "@explicit.js.mvc/observable";

export class UserModel extends DomObservableModel {
    id: string | number = "";
    name: string = "";
    email: string = "";
    username: string = "";
    allowed: boolean = true;
}

Container.register("CurrentUser", UserModel);
