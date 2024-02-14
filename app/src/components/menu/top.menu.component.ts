// import { Observable } from '@explicit.js.mvc/observable';
// import { SessionModel } from '@app/models/session.model';
// import { Component } from '@explicit.js.mvc/component';
// import { inject, injectionTarget } from '@explicit.js.mvc/di/container';
// import { TopMenuModel } from './top.menu.model';

// @injectionTarget()
// export class TopMenuComponent extends Component<Observable<Array<TopMenuModel>>> {

// 	private _session: SessionModel;
// 	constructor(@inject() private session: SessionModel) {
// 		super(session.menu_items);
// 		this._session = session;
// 		this.template = "./top-menu-default.html";
// 		// we add the callbak so the component will be re-rendered.
// 		if (this._session.menu_items instanceof Observable)
// 			this._session.menu_items.addCallback(this.onDataChange);
// 	}

// 	protected render(): void {
// 		let items: Array<TopMenuModel>;
// 		if (this._session.menu_items instanceof Observable)
// 			items = this._session.menu_items.data;
// 		else
// 			items = this._session.menu_items;
// 		const len = items.length;
// 		let html = /*html*/`<ul class="nav justify-content - center">`;
// 		for (var i = 0; i < len; i++) {
// 			const item = items[i];
// 			html += /*html*/`<li><a href="${item.link}" class="${item.class}">${item.title}</a></li>`;
// 		}
// 		html += /*html*/`</ul>`;
// 		this.innerHTML = html;
// 	}
// }

// customElements.define('top-menu-component', TopMenuComponent);
