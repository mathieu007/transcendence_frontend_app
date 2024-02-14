import type { ModalDefaultComponent } from "@component/modal/default";
import { Template, type TemplateNode } from "@explicit.js.mvc/template";
import { ModalDefaultModel } from "@model/modal/default";

export class ModalDefaultTemplate extends Template<ModalDefaultModel> {
    public generateTemplate(
        comp: ModalDefaultComponent,
        model: ModalDefaultModel,
        childContent: Element
    ): TemplateNode {
        return /*html*/ `
        <div class="modal-Modal" role="document">
        	<div class="modal-content rounded-4 shadow">
        		<div class="modal-header border-bottom-0">
        			<h1 class="modal-title fs-5">${model.title}</h1>
        			<button type="button" class="btn-close" click="${comp.close()}" aria-label="Close"></button>
        		</div>
        		<div class="modal-body py-0">
        			<p class="${model.class}">${childContent}</p>
					<input input="${comp.event()}" type="input" value="123 test"/>
        			<input change="${comp.event()}" type="checkbox" checked="${model.is_opened}" />
        		</div>
        		<div class="modal-footer flex-column align-items-stretch w-100 gap-2 pb-3 border-top-0">
        			<button-component click="${comp.close()}">Close</button-component>
        		</div>
        	</div>
        </div>`;
    }
}
