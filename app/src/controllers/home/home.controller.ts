import { Controller } from "@explicit.js.mvc/controller";
import {
    inject,
    injectionTarget
} from "@explicit.js.mvc/di/container";
import { AppModel } from "@explicit.js.mvc/app.model";
import { HomeViewModel } from "@viewModel/home/home";
import { DefaultLayout } from "@layout/default";
import { HistoryEnabled, Query, Route, Router, type QueryParameter } from "@explicit.js.mvc/route/router";

@injectionTarget()
export class HomeController extends Controller<
    AppModel,
    DefaultLayout,
    HomeViewModel
> {
    constructor(
        @inject(AppModel) app: AppModel,
        @inject(DefaultLayout) layout: DefaultLayout,
        @inject(HomeViewModel) model: HomeViewModel
    ) {
        super(app, layout, model);
    }
	
    @Route("/home")
    public index(): void {
        console.log("HomeController.index()");
    }
	
    @Route("/test/${id}")
    public test(id: number): void {
        console.log(`going to routes: /test/${id}`);
    }
	
    @Route("/test/${id}")
	@HistoryEnabled(false)
	@Query(["filter", "search"])
    public testFilter(id: number, q: QueryParameter): void {
        console.log(`going to routes: /test/${id}`);
    }
}

