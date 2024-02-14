import { Observable, type DomObservableModel } from "./observable";
import {
    Template,
    type ComponentTemplate,
    type TemplateNode
} from "./template";

export abstract class Component<TModel extends DomObservableModel> {
    public static htmlTagName: string | undefined;
    protected _template: Template<TModel>;
    private _referenceCounter: number = 0;
    protected _parentComponent: Component<TModel> | undefined;
    private _model: TModel | undefined;
    private _content: Element | undefined = undefined;
    private _contentVarName: string;

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

    get content(): Element {
        return this._content;
    }

    set content(content: Element) {
        this._content = content;
    }

    get contentVarName(): string {
        return this._contentVarName;
    }

    set contentVarName(contentVarName: string) {
        this._contentVarName = contentVarName;
    }

    constructor(model: TModel, template: Template<TModel>) {
        this._model = model;
        this._template = template;
        this._parentComponent = undefined;
        const elemNode = document.createElement("span");
        elemNode.setAttribute("style", "all: initial;");
        this._content = elemNode;
        this._domObserver();
        let myModel: TModel;
        if (this._model instanceof Observable) myModel = this._model.data;
        else myModel = this._model;
        this._template.rootElement = this._template.generateTemplate(
            this,
            myModel,
            this._content
        ) as ComponentTemplate;
        this._template.rootElement.is_component = true;
        // this._session.menu_items.addCallback(this.onDataChange);
        this.onInit();
    }

    protected onInit(): void {}

    private _onNodeRemoval(
        mutation: MutationRecord,
        cls: Component<TModel>
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
                    cls._parentComponent = undefined;
                    cls._template = undefined;
                }
            }
        }
    }

    private _onNodeAdd(mutation: MutationRecord, cls: Component<TModel>): void {
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
        const cls: Component<TModel> = this;
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

    get parentComponent(): Component<TModel> | undefined {
        return this._parentComponent;
    }

    set parentComponent(component: Component<TModel>) {
        this._parentComponent = component;
    }

    get element(): ComponentTemplate {
        return this._template.rootElement;
    }

    get template(): Template<TModel> {
        return this._template;
    }

    set template(template: Template<TModel>) {
        this._template = template;
    }

    // Do not call this function, is automatically called while the component is being destroyed.
    // You can however override the function and put some of the data you wish to be deleted.
    // if you override this function do not forget to call underlying method using super.dispose().
    // this method is called only when ALL references of the component are deleted.
    protected dispose(): void {}

    protected render(): void {}

    // !!!important do not call render function into derived class, is already called in component class, if you have registered a an Observable<T> data source this is the callback that will be called.
    protected onDataChange<T extends object>(
        data: T,
        propertyPath: string | symbol,
        oldValue: object,
        newValue: object
    ): void {
        // this.render();
        void oldValue;
        const key = String(propertyPath);
        let model: TModel;
        if (this._model instanceof Observable)
            model = this._model.data as TModel;
        else model = this._model as TModel;
        model.updateDomNodes(key, newValue);
    }
}