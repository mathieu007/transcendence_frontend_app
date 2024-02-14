import { ButtonDefaultComponent } from "@component/button/default";
import type { Template } from "@explicit.js.mvc/template";
import { ButtonDefaultModel } from "@model/button/default";

export class ButtonAComponent extends ButtonDefaultComponent {
  constructor(
    model: ButtonDefaultModel,
    template: Template<ButtonDefaultModel>
  ) {
    super(model, template);
  }
}
