import { Component } from "@explicit.js.mvc/component";
import type { ModalDefaultModel } from "@model/modal/default";
import type { ModalDefaultTemplate } from "@template/modal/default";
import { Modal } from "bootstrap";

export class ModalDefaultComponent extends Component<ModalDefaultModel> {
    private _modal: Modal;
    constructor(model: ModalDefaultModel, template: ModalDefaultTemplate) {
        super(model, template);
    }

    protected onInit(): void {
        let options: Modal.Options = Modal.Default;
        options.keyboard = true;
        this._modal = new Modal(this._template.rootElement, options);
    }

    protected dispose() {
        this._modal.dispose();
    }

    public event(): void {
        console.log("Event fired!");
    }

    public close(): void {
        let data = this.model;
        this._modal.hide();
        data.is_opened = false;
    }

    public open(): void {
        let data = this.model;
        this._modal.show();
        data.is_opened = true;
    }
}
