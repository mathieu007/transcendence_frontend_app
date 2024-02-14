import { UsersViewModel } from "@viewModel/users/users";
import { UsersServices } from "@services/users";
import { inject, injectionTarget } from "@explicit.js.mvc/di/container";

@injectionTarget()
export class UsersController {
  private _usersService: UsersServices;
  private _usersViewModel: UsersViewModel;
  constructor(
    @inject("UsersServices") private usersService: UsersServices,
    @inject("UsersViewModel") private usersViewModel: UsersViewModel
  ) {
    this._usersService = usersService;
    this._usersViewModel = usersViewModel;
  }
}
