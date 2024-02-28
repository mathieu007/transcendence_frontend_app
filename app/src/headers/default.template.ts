import { HeaderTemplate } from "@explicit.js.mvc/header.template";
import type { TemplateNode } from "@explicit.js.mvc/template";
import type { DefaultHeader } from "@header/default";
import type { HeaderDefaultModel } from "@model/header/default";

export class HeaderDefaultTemplate extends HeaderTemplate<HeaderDefaultModel> {
    public generateTemplate(header: DefaultHeader, model: HeaderDefaultModel): TemplateNode {
        return /*html*/ `
        <head>
        	<meta charset="UTF-8" />
        	<link rel="icon" type="image/svg+xml" href="/vite.svg" />
        	<meta name="viewport" content="width=device-width, initial-scale=1.0" />            
        	<title>${model.title}</title>
        </head>`;
    }
}
