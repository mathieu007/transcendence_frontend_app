import type { AppModel } from "@explicit.js.mvc/app.model";
import { LayoutTemplate } from "@explicit.js.mvc/layout.template";
import type { TemplateNode } from "@explicit.js.mvc/template";
import type { DefaultLayout } from "@layout/default";
import type { LayoutDefaultModel } from "@model/layouts/default";

export class HeaderDefaultTemplate extends LayoutTemplate<LayoutDefaultModel> {
	public generateTemplate(
		layout: DefaultLayout,
		model: LayoutDefaultModel
	): TemplateNode {
		return /*html*/ `
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${model.title}</title>`;
	}
}
