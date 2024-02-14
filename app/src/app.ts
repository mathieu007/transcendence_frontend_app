import { HomeController } from "@controller/home/home";
import { BaseApp } from "@explicit.js.mvc/base.app";
import { Container } from "@explicit.js.mvc/di/container";
import { Router } from "@explicit.js.mvc/route/router";

export class App extends BaseApp 
{
	public RegisterControllers(): void {
		Router.register(HomeController);
	}
	
	public RegisterContainers(): void {
		
	}
	public home: HomeController = Container.register(HomeController);
	
}