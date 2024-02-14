import "./style.css";
import "@css/styles";
import { Popover } from "bootstrap";
import { setupCounter } from "./counter.ts";
import { AppModel } from "@explicit.js.mvc/app.model";
import { Container } from "@explicit.js.mvc/di/container";
import { DefaultLayout } from "@layout/default";
import { HomeController } from "@controller/home/home";
import { Router } from "@explicit.js.mvc/route/router";
import { App } from "src/app.ts";

let appModel: AppModel = Container.get<AppModel>(AppModel);
appModel.active_layout = Container.get<DefaultLayout>(DefaultLayout);
export const app = new App();
Router.navigate("/home");

setupCounter(document.querySelector<HTMLButtonElement>("#counter")!);

document.querySelectorAll('[data-bs-toggle="popover"]').forEach((popover) => {
    new Popover(popover);
});

window.addEventListener("DOMContentLoaded", (_event) => {
    // Toggle the side navigation
    const sidebarToggle = document.body.querySelector("#sidebarToggle");
    if (sidebarToggle) {
        // Uncomment Below to persist sidebar toggle between refreshes
        // if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
        //     document.body.classList.toggle('sb-sidenav-toggled');
        // }
        sidebarToggle.addEventListener("click", (event) => {
            event.preventDefault();
            document.body.classList.toggle("sb-sidenav-toggled");
            const str = new String(
                document.body.classList.contains("sb-sidenav-toggled")
            ).toString();
            localStorage.setItem("sb|sidebar-toggle", str);
        });
    }
});
