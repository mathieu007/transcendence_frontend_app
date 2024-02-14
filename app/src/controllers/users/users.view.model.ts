import type { SessionModel } from "@model/session";
import { UserModel } from "@model/user";
import { inject } from "@explicit.js.mvc/di/container";

export class UsersViewModel {
  constructor(@inject("SessionModel") sessionModel: SessionModel) {
    this.session = sessionModel;
  }
  public users: Array<UserModel> | undefined;
  public session: SessionModel;
}
