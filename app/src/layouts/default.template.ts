import type { AppModel } from "@explicit.js.mvc/app.model";
import { LayoutTemplate } from "@explicit.js.mvc/layout.template";
import type { TemplateNode } from "@explicit.js.mvc/template";
import type { DefaultLayout } from "@layout/default";
import type { LayoutDefaultModel } from "@model/layouts/default";

export class LayoutDefaultTemplate extends LayoutTemplate<LayoutDefaultModel> {
    public generateTemplate(
        layout: DefaultLayout,
        model: LayoutDefaultModel
    ): TemplateNode {
        return /*html*/ `
        <div>
        	<div class="trans-backgroud">
        		<div class="container">
        			<header
        				class="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4">
        				<div class="col-md-3 mb-2 mb-md-0">
        					<a href="/" class="d-inline-flex link-body-emphasis text-decoration-none">
        						<img class="logo change-color" src="/assets/img/logo.svg.convert.svg" width="32" />
        					</a>
        				</div>
        				<ul class="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
        					<li><a href="/" class="nav-link px-2 link-secondary">Home</a></li>
        					<li><a href="/#" class="nav-link px-2">Features</a></li>
        					<li><a href="/#" class="nav-link px-2">Pricing</a></li>
        					<li><a href="/#the-game" class="nav-link px-2">The Game</a></li>
        					<li><a href="/#about" class="nav-link px-2">About</a></li>
        					<li><a href="/#contact" class="nav-link px-2">Contact Us</a></li>
        				</ul>
        				<ul class="nav col-md-3 justify-content-right text-end">
        					<li>
        						<a type="button" role="button" href="/#login"
        							class="btn btn-outline-primary me-2">Login</a>
        					</li>
        					<li>
        						<a type="button" role="button" href="/#signup" class="btn btn-primary">Sign-up</button>
        					</li>
        					<li>
        						<div class="nav-item dropdown">
        							<a class="nav-link dropdown-toggle" id="navbarDropdown" href="#" role="button"
        								data-bs-toggle="dropdown" aria-expanded="false"><i
        									class="fa-regular fa-user fa-fw"></i></a>
        							<ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
        								<li><a class="dropdown-item" href="/#settings">Settings</a></li>
        								<li><a class="dropdown-item" href="/#activity">Activity Log</a></li>
        								<li>
        									<hr class="dropdown-divider" />
        								</li>
        								<li><a class="dropdown-item" href="/#logout">Logout</a></li>
        							</ul>
        						</div>
        					</li>
        				</ul>
        			</header>
        		</div>
        	</div>
        	<controller-component></controller-component>
        	<link href="/css/styles.css" rel="stylesheet" />
        	<link href="/fontawesome/css/fontawesome.min.css" rel="stylesheet" />
        	<link href="/fontawesome/css/regular.min.css" rel="stylesheet" />
        	<link href="/fontawesome/css/solid.min.css" rel="stylesheet" />
        	<script type="module" src="/src/main.ts"></script>
        </div>`;
    }
}
