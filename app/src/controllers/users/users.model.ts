import { UserModel } from "@model/user";
import { inject } from "@explicit.js.mvc/di/container";

export class UsersModel {
    constructor() {}
    public users: Array<UserModel> | undefined;
}
