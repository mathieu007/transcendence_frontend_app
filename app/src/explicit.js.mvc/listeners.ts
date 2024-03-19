interface Func {
    func: () => void;
}

export class Listeners {
    private static _clickListenersFunc: Map<string, () => void> = new Map();
    private static _changeListenersFunc: Map<string, () => void> = new Map();
    private static _inputListenersFunc: Map<string, () => void> = new Map();
    public static addClickListener() {
        document.addEventListener("click", (event) => {
            let targetElement = event.target as HTMLElement;
            while (targetElement && targetElement !== document.body) {
                if (targetElement.hasAttribute("click")) {
                    console.log("Clicked element with 'click' attribute:", targetElement.getAttribute("click"));
                    break;
                }
                targetElement = targetElement.parentElement as HTMLElement;
            }
            if (targetElement.hasAttribute("click")) {
                if (targetElement instanceof Element) {
                    const key = targetElement.getAttribute("click");
                    Listeners.execClick(key);
                }
            }
        });
    }

    public static registerListeners() {
        Listeners.addClickListener();
        Listeners.addChangeListener();
        Listeners.addInputListener();
    }

    public static addChangeListener() {
        document.addEventListener("change", (event) => {
            if (event.target instanceof Element && event.target.getAttribute("change")) {
                const key = event.target.getAttribute("change");
                Listeners.execChange(key);
            }
        });
    }

    public static addInputListener() {
        document.addEventListener("input", (event) => {
            if (event.target instanceof Element && event.target.getAttribute("input")) {
                const key = event.target.getAttribute("input");
                Listeners.execInput(key);
            }
        });
    }

    public static addClickListenerFunc(elem: Element, key: string, func: () => void): void {
        elem.setAttribute("click", key);
        Listeners._clickListenersFunc.set(key, func);
    }

    public static addChangeListenerFunc(elem: Element, key: string, func: () => void): void {
        elem.setAttribute("change", key);
        Listeners._changeListenersFunc.set(key, func);
    }

    public static addInputListenerFunc(elem: Element, key: string, func: () => void): void {
        elem.setAttribute("input", key);
        Listeners._inputListenersFunc.set(key, func);
    }

    public static execClick(key: string) {
        let func: () => void = Listeners._clickListenersFunc.get(key);
        if (func !== undefined) func();
    }
    public static execChange(key: string) {
        let func: () => void = Listeners._changeListenersFunc.get(key);
        if (func !== undefined) func();
    }
    public static execInput(key: string) {
        let func: () => void = Listeners._inputListenersFunc.get(key);
        if (func !== undefined) func();
    }
}

Listeners.registerListeners();
