import { Controller } from "@explicit.js.mvc/controller";
import { inject, injectionTarget } from "@explicit.js.mvc/di/container";
import { HomeModel } from "@model/home/home";
import { DefaultLayout } from "@layout/default";
import { HistoryEnabled, Query, Route, type QueryParameter } from "@explicit.js.mvc/routing/router";
import { HomeTemplate } from "@template/home/home";
import { App } from "@app";
import { DefaultHeader } from "@header/default";

// @injectionTarget()
export class HomeController extends Controller<App, DefaultHeader, DefaultLayout, HomeModel> {
    constructor(
        @inject("App", App) app: App,
        @inject("DefaultHeader", DefaultHeader) header: DefaultHeader,
        @inject("DefaultLayout", DefaultLayout) layout: DefaultLayout,
        @inject("HomeModel", HomeModel) model: HomeModel,
        @inject("HomeTemplate", HomeTemplate) template: HomeTemplate
    ) {
        super(app, header, layout, model, template);
    }
    // @Route("/")
    // public index(): void {
    //     console.log("HomeController.index()");
    // }
    // @Route("/test/${id}")
    // public test(id: number): void {
    //     console.log("HomeController.test(id)");
    // }
    @Query(["filter", "page"])
    @HistoryEnabled(false)
    @Route("/testtttt/${id}")
    public testFilter(id: number, q: QueryParameter): void {
        console.log(`going to routes: /test/${id}?page=${q.page}&filter=${q.filter}`);
    }
}
