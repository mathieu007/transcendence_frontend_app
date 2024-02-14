import { ButtonDefaultComponent } from "@component/button/default";
import { Component } from "@explicit.js.mvc/component";
import type { Template } from "@explicit.js.mvc/template";
import { ButtonDefaultModel } from "@model/button/default";

export class ButtonInputComponent extends ButtonDefaultComponent {
  constructor(
    model: ButtonDefaultModel,
    template: Template<ButtonDefaultModel>
  ) {
    super(model, template);
  }
}
