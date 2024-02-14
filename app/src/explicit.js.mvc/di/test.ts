// import { Container, inject, injectionTarget } from "./container";

// type User = { name: string; }

// // example for a class to be injected
// class UserRepository {
// 	findAllUser(): User[] {
// 		return [{ name: "Jannik" }, { name: "Max" }]
// 	}
// }

// @injectionTarget()
// class UserService {
// 	userRepository: UserRepository;

// 	// an instance of the UserRepository class, identified by key 'UserRepositroy' should be injected
// 	constructor(@inject("UserRepository") userRepository?: UserRepository) {
// 		// ensures userRepository exists and no checks for undefined are required throughout the class

// 		if (!userRepository) throw Error("No UserRepository provided or injected.")
// 		this.userRepository = userRepository;
// 	}

// 	getAllUser(): User[] {
// 		// access to an instance of UserRepository
// 		return this.userRepository.findAllUser()
// 	}
// }

// @injectionTarget()
// class UserController {
// 	userService: UserService;

// 	// an instance of the UserRepository class, identified by key 'UserRepositroy' should be injected
// 	constructor(@inject("UserService") userService?: UserService) {
// 		// ensures userRepository exists and no checks for undefined are required throughout the class
// 		if (!userService) throw Error("No UserRepository provided or injected.")
// 		this.userService = userService;
// 	}

// 	getAllUser(): User[] {
// 		// access to an instance of UserRepository
// 		return this.userService.getAllUser()
// 	}
// }

// @injectionTarget()
// class UserController2 {
// 	userService: UserService;

// 	// an instance of the UserRepository class, identified by key 'UserRepositroy' should be injected
// 	constructor(@inject('UserService') userService?: UserService) {
// 		// ensures userRepository exists and no checks for undefined are required throughout the class
// 		if (!userService) throw Error("No UserRepository provided or injected.")
// 		this.userService = userService;
// 	}

// 	getAllUser(): User[] {
// 		// access to an instance of UserRepository
// 		return this.userService.getAllUser()
// 	}
// }

// // initially register all classes which should be injectable with the Container
// Container.register("UserRepository", new UserRepository())
// Container.register("UserService", new UserService())

// // const userService = new UserService()
// const userController = new UserController()
// const userController2 = new UserController2()
// // userService has access to an instance of UserRepository without having it provided in the constructor
// // -> it has been injected!
// console.log(userController.getAllUser())
// console.log(userController2.getAllUser())
