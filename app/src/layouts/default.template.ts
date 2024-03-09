import { LayoutTemplate } from "@explicit.js.mvc/layout.template";
import { TemplateNode } from "@explicit.js.mvc/template";
import type { DefaultLayout } from "@layout/default";
import { LayoutDefaultModel } from "@model/layout/default";

export class LayoutDefaultTemplate extends LayoutTemplate<LayoutDefaultModel> {
	public generateTemplate(layout: DefaultLayout, model: LayoutDefaultModel): TemplateNode {
		return /*html*/ `
        <div>
        	<div class="trans-backgroud">
        		<div class="container">
        			<header
        				class="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3">
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
        				<ul class="nav col-md-3 justify-content-end text-end">
        					<li>
        						<a type="button" role="button" href="/login"
        							class="btn btn-outline-primary me-2"><span>Login</span></a>
        					</li>
        					<li>
        						<a type="button" role="button" href="/#signup" class="btn btn-primary me-2"><span>Sign-up</span></a>
        					</li>
        					<li>
								<div style="height:100%" class="dropdown text-end d-flex align-items-center justify-content-center">
									<a class="d-block mx-auto link-body-emphasis text-decoration-none dropdown-toggle" id="navbarDropdown" href="#" role="button"
        								data-bs-toggle="dropdown" aria-expanded="false"><i
        									class="fa-regular fa-user fa-fw"></i>
									</a>
									<ul class="dropdown-menu text-small" style="">
										<li><a class="dropdown-item" href="#">New project...</a></li>
										<li><a class="dropdown-item" href="#">Settings</a></li>
										<li><a class="dropdown-item" href="#">Profile</a></li>
										<li>
											<hr class="dropdown-divider">
										</li>
										<li><a class="dropdown-item" href="#">Sign out</a></li>
									</ul>
								</div>
        					</li>
        				</ul>
        			</header>
        		</div>
        	</div>

        	<controller-component></controller-component>
			<div class="content-wrap">
			<div class="mpl-box-md">
                    <div class="container">
                        <div class="row hgap-lg vgap-lg">
                            <div class="col-12 col-lg-5">
                                <h2>Contact Us</h2>
                                <p>After moved, male won't Moveth moveth fruitful don't forth you bearing morning made male without life be blessed rule stars divided two. Firmament of, him she'd good of his morning.</p>
                                <ul class="mpl-list mpl-list-horizontal list-hgap list-vgap mt-30">
                                    <li>
                                        <a href="#" class="text-1">
                                            <svg width="28" height="28" class="icon icon-fill" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M24.7875 16.6223C24.3167 17.2324 23.1708 17.6664 23.1708 17.6664L14.625 20.8289V18.4957L20.9125 16.184C21.625 15.9219 21.7375 15.548 21.1542 15.3504C20.575 15.1527 19.525 15.2086 18.8125 15.475L14.625 17.0004V14.577C15.5917 14.2418 16.5875 13.9926 17.7792 13.8551C19.4833 13.6617 21.5667 13.8809 23.2042 14.5211C25.0458 15.1227 25.2542 16.0121 24.7875 16.6223ZM15.4375 12.6477V6.675C15.4375 5.97461 15.3125 5.33008 14.675 5.14531C14.1875 4.98203 13.8833 5.45039 13.8833 6.15078V21.0996L9.975 19.8191V2C11.6375 2.31797 14.0583 3.06992 15.3583 3.52109C18.6708 4.69414 19.7917 6.15508 19.7917 9.44219C19.7917 12.6434 17.875 13.8594 15.4375 12.6477V12.6477ZM2.8 18.2508C0.90833 17.7008 0.591663 16.5535 1.45416 15.8961C2.25 15.2859 3.60833 14.8262 3.60833 14.8262L9.2125 12.7723V15.1141L5.17916 16.6008C4.46666 16.8629 4.35833 17.2367 4.9375 17.4344C5.51666 17.632 6.56666 17.5762 7.27916 17.3098L9.2125 16.5836V18.6805C7.0625 19.0801 4.9875 18.9941 2.8 18.2508V18.2508Z"></path>
                                            </svg>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" class="text-1">
                                            <svg width="26" height="26" class="icon icon-fill" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M24 12C24 18.629 18.6194 24 11.9806 24C6.47419 24 1.83871 20.3081 0.416129 15.271L5.02258 17.1726C5.33226 18.7258 6.71129 19.9016 8.35645 19.9016C10.2532 19.9016 11.8355 18.3339 11.7532 16.3452L15.8419 13.4323C18.3629 13.4952 20.4774 11.4532 20.4774 8.90806C20.4774 6.41129 18.4452 4.38387 15.9435 4.38387C13.4419 4.38387 11.4097 6.41613 11.4097 8.90806V8.96613L8.54516 13.1129C7.79516 13.0694 7.05968 13.2774 6.44032 13.6984L0 11.0371C0.493548 4.85806 5.66613 0 11.9806 0C18.6194 0 24 5.37097 24 12ZM7.53387 18.2081L6.05806 17.5984C6.32926 18.1615 6.79752 18.6057 7.37419 18.8468C8.67581 19.3887 10.171 18.7694 10.7129 17.4726C10.9742 16.8435 10.979 16.1516 10.7177 15.5226C10.4565 14.8935 9.96774 14.4 9.33871 14.1387C8.71452 13.8774 8.04677 13.8871 7.45645 14.1097L8.98065 14.7387C9.93871 15.1355 10.3935 16.2339 9.99194 17.1919C9.59032 18.1548 8.49194 18.6048 7.53387 18.2081V18.2081ZM15.9435 11.9226C14.279 11.9226 12.9242 10.5677 12.9242 8.90806C12.9242 7.24839 14.279 5.89355 15.9435 5.89355C17.6081 5.89355 18.9629 7.24839 18.9629 8.90806C18.9629 10.5677 17.6129 11.9226 15.9435 11.9226V11.9226ZM15.9484 11.1677C17.2016 11.1677 18.2177 10.1516 18.2177 8.90323C18.2177 7.65 17.2016 6.63871 15.9484 6.63871C14.6952 6.63871 13.679 7.65484 13.679 8.90323C13.6839 10.1516 14.7 11.1677 15.9484 11.1677Z"></path>
                                            </svg>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" class="text-1">
                                            <svg width="28" height="28" class="icon icon-fill" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M20.7546 9.86876L18.5546 1.63251L10.3417 3.83938L9.12502 5.9904L6.65836 5.97192L0.647522 12L6.65919 18.0294L9.12461 18.0109L10.3429 20.1593L18.5546 22.3662L20.7546 14.1325L19.5046 12L20.7546 9.86876ZM9.32377 6.33673L15.6063 4.71723L12 10.9829H4.78627L9.32377 6.33673ZM9.32377 17.6646L4.78627 13.0188H12L15.6063 19.2841L9.32377 17.6646ZM17.3654 18.2661L13.7571 12L17.3646 5.73344L19.1067 12L17.3654 18.2661Z"></path>
                                            </svg>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div class="col-12 col-lg-7">
                                <form action="php/ajax-contact-form.php" method="POST" role="form" class="mpl-form-ajax row vgap" data-toggle="validator" novalidate="true">
                                    <div class="col-12 col-md-6">
                                        <input class="form-control" type="text" id="contact_name" name="name" placeholder="Name" required=""><span class="form-control-bg"></span>
                                    </div>
                                    <div class="col-12 col-md-6">
                                        <input class="form-control" type="email" id="contact_email" name="email" placeholder="Email" required=""><span class="form-control-bg"></span>
                                    </div>
                                    <div class="col-12">
                                        <textarea class="form-control" rows="5" id="contact_message" name="message" placeholder="Message" required=""></textarea>
                                    </div>
                                    <div class="col-12">
                                        <button type="submit" class="btn btn-md disabled">Submit</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
	</div>
        	<!-- <link href="/css/styles.css" rel="stylesheet" /> -->
        	<link href="/fontawesome/css/fontawesome.min.css" rel="stylesheet" />
        	<link href="/fontawesome/css/regular.min.css" rel="stylesheet" />
        	<link href="/fontawesome/css/solid.min.css" rel="stylesheet" />			
        </div>`;
	}
}
