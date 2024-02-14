import { Component } from "@explicit.js.mvc/component";
import type { Template } from "@explicit.js.mvc/template";
import { ButtonDefaultModel } from "@model/button/default";
import { Button } from "bootstrap";

export class ButtonDefaultComponent extends Component<ButtonDefaultModel> {
    private _button: Button;
    constructor(
        model: ButtonDefaultModel,
        template: Template<ButtonDefaultModel>
    ) {
        super(model, template);
    }
    protected onInit(): void {
        this._button = new Button(this._template.rootElement);
    }
    public toggle(): void {
        this._button.toggle();
    }
    protected dispose(): void {
        this._button.dispose();
    }
    public onClick(): void {
        this.toggle();
    }
}
