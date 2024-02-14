import type { LayoutTemplate } from "@explicit.js.mvc/layout.template";
import { Observable } from "./observable";
import { ComponentTemplate } from "./template";
import type { LayoutModel } from "@explicit.js.mvc/layout.model";
import { Container } from "@explicit.js.mvc/di/container";
import type { AppModel } from "@explicit.js.mvc/app.model";

export abstract class Layout<TModel extends LayoutModel> {
    public static htmlTagName: string | undefined;
    protected _template: LayoutTemplate<TModel>;
    private _referenceCounter: number = 0;
    private _model: TModel | undefined;
    private _app: AppModel;

    set attributes(attributes: { name: string; value: string }[]) {
        attributes.forEach((item) => {
            this._template.rootElement.setAttribute(item.name, item.value);
        });
    }

    get attributes(): NamedNodeMap {
        return this._template.rootElement.attributes;
    }

    get model(): TModel {
        if (this._model instanceof Observable)
            return this._model.data as TModel;
        return this._model as TModel;
    }

    constructor(model: TModel, template: LayoutTemplate<TModel>) {
        this._model = model;
        this._template = template;
        this._template.rootElement.is_component = true;
        this._domObserver();
        let mo: TModel;
        if (this._model instanceof Observable) mo = this._model.data;
        else mo = this._model;
        this._app = Container.get<AppModel>("AppModel");
        this._template.generateTemplate(this, mo);
        this.onInit();
    }

    protected onInit(): void {}

    private _onNodeRemoval(
        mutation: MutationRecord,
        cls: Layout<TModel>
    ): void {
        if (mutation.type === "childList" && mutation.removedNodes.length > 0) {
            if (
                Array.from(mutation.removedNodes).includes(
                    cls._template.rootElement
                )
            ) {
                cls._referenceCounter--;
                if (cls._referenceCounter === 0) {
                    cls.dispose();
                    cls._template = undefined;
                }
            }
        }
    }

    private _onNodeAdd(mutation: MutationRecord, cls: Layout<TModel>): void {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            if (
                Array.from(mutation.addedNodes).includes(
                    cls._template.rootElement
                )
            ) {
                cls._referenceCounter++;
            }
        }
    }

    private _observer: MutationObserver | null = null;

    private _domObserver(): void {
        const cls: Layout<TModel> = this;
        this._observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                cls._onNodeAdd(mutation, cls);
                cls._onNodeRemoval(mutation, cls);
            });
            if (cls._referenceCounter == 0) cls._disconnectObserver();
        });
        const config = { childList: true, subtree: true };
        this._observer.observe(document.body, config);
    }

    private _disconnectObserver(): void {
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }
    }
    get element(): ComponentTemplate {
        return this._template.rootElement as ComponentTemplate;
    }

    get template(): LayoutTemplate<TModel> {
        return this._template;
    }

    set template(template: LayoutTemplate<TModel>) {
        this._template = template;
    }

    protected dispose(): void {}

    // !!!important do not call render function into derived class, is already called in component class, if you have registered a an Observable<T> data source this is the callback that will be called.

}
