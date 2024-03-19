import "./scss/styles.scss";
import { Popover } from "bootstrap";
import { Container } from "@explicit.js.mvc/di/container";
import { App } from "@app";
import { Routes } from "@explicit.js.mvc/routing/routes";
import { QueryParameter, Route, Router, Url } from "@explicit.js.mvc/routing/router";
import { HomeController } from "@controller/home/home";

Router.register("HomeController", HomeController);
let routes = new Routes();
App.routes = routes;
Container.register("App", App);
let home = Container.register("HomeController", HomeController);
Router.navigate(Url.getCurrentUrl());

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
            const str = new String(document.body.classList.contains("sb-sidenav-toggled")).toString();
            localStorage.setItem("sb|sidebar-toggle", str);
        });
    }
});
