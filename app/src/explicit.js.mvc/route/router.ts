import type { AppModel } from "@explicit.js.mvc/app.model";
import type { Controller } from "@explicit.js.mvc/controller";
import { Container } from "@explicit.js.mvc/di/container";
import type { Layout } from "@explicit.js.mvc/layout";
import type { LayoutModel } from "@explicit.js.mvc/layout.model";
import type { DomObservableModel } from "@explicit.js.mvc/observable";

const redirect404 = "/page_not_found_404.html";
interface Constructor<T> {
    new (...args: any[]): T;
}

interface NormalizeUrlOptions {
    removeTrailingSlash?: boolean;
    deduplicateParams?: boolean;
    returnAbsolute?: boolean;
    includeQueryParams?: boolean;
}

const routes: Map<string, Array<RouteData>> = new Map();
const controllerInstances: Map<
    string,
    Controller<AppModel, Layout<LayoutModel>, DomObservableModel>
> = new Map();

class RouteParams {
    constructor(name: string, type: "string" | "number" | "bigint" | "query") {
        this.name = name;
        this.type = type;
    }
    public name: string;
    public type: "string" | "number" | "bigint" | "query";
}

class RouteData {
    public raw_url: string;
    public initialized: boolean = false;
    public descriptor: PropertyDescriptor;
    public signature: string;
    public history: boolean = true;
    public queryMatches: string[] | undefined;
    public params: Array<RouteParams>;
    public controller: Controller<
        AppModel,
        Layout<LayoutModel>,
        DomObservableModel
    >;
    public args: Array<string | number | bigint | QueryParameter> | undefined;
    public queryParams: QueryParameter | undefined;
    public methodName: string;
}

export class QueryParameter {
    [key: string]:
        | string
        | number
        | bigint
        | QueryParameter
        | Function
        | Array<string | number | bigint | QueryParameter>;

    constructor(initialValues: { [key: string]: any } = {}) {
        Object.entries(initialValues).forEach(([key, value]) => {
            this[key] = value;
        });
    }

    get length(): number {
        let count = 0;
        this.forEach((key, value) => {
            count++;
        });
        return count;
    }

    forEach(callback: (key: string, value: any) => void): void {
        Object.entries(this).forEach(([key, value]) => {
            callback(key, value);
        });
    }
}

function getParamNamesFromMethod(func: Function) {
    const fnStr = func
        .toString()
        .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm, "");
    let result = fnStr
        .slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")"))
        .match(/([^\s,]+)/g);
    return result === null ? [] : result;
}

function createRoute(
    target: Controller<AppModel, Layout<LayoutModel>, DomObservableModel>,
    methodName: string,
    descriptor: PropertyDescriptor
) {
    let route: RouteData;
    if (descriptor.value.route === undefined) {
        route = new RouteData();
        route.methodName = methodName;
        route.descriptor = descriptor;
        route.controller = target;
        route.params = new Array();
    } else route = descriptor.value.route;
    route.descriptor = descriptor;
    descriptor.value.route = route;
    return route;
}

function checkParameterName(methodParamsNames: string[], urlsParts: string[]) {
    let urlParameters = getParameters(urlsParts);
    for (let i = 0; i < urlParameters.length; i++) {
        if (methodParamsNames.indexOf(urlParameters[i]) === -1)
            throw new Error("Route contains unexisting method parameters.");
    }
}

function getParameters(urlParts: string[]): string[] {
    let arr: string[] = [];
    for (let i = 0; i < urlParts.length; i++) {
        let url = urlParts[i].trim();
        if (url.startsWith("${") && url.endsWith("}"))
            arr.push(url.substring(2, url.length - 3).trim());
    }
    return arr;
}

function createUrlSignature(
    route: RouteData,
    urlParts: string[],
    withQueryParams: boolean
): string {
    let signature = "/";
    urlParts.forEach((elem) => {
        let p = elem.trim();
        if (p !== "") {
            if (p.startsWith("${") && p.endsWith("}"))
                signature += "::param::/";
            else signature += p + "/";
        }
    });
    if (withQueryParams) {
        if (route.queryMatches !== undefined) {
            route.queryMatches = route.queryMatches.sort();
            if (route.queryMatches.length > 0)
                signature += `?${route.queryMatches[0]}=0`;
            for (let i = 1; i < route.queryMatches.length; i++) {
                signature += `&${route.queryMatches[i]}=${i}`;
            }
        }
    }
    signature = Url.normalize(signature, {
        removeTrailingSlash: false,
        deduplicateParams: true,
        returnAbsolute: false,
        includeQueryParams: withQueryParams
    });
    return signature;
}

function getParamType(p: any): "string" | "number" | "bigint" | "query" {
    let type: "string" | "number" | "bigint" | "query";
    if (p instanceof QueryParameter) type = "query";
    else if (typeof p === "string") type = "string";
    else if (typeof p === "number") type = "number";
    else if (typeof p === "bigint") type = "bigint";
    else {
        throw new Error(`Parameter is not a valid parameter type.`);
    }
    return type;
}

function createRouteMetaData(route: RouteData, paramsNames: string[]) {
    for (let i = 0; i < paramsNames.length; i++) {
        let pName = paramsNames[i];
        if (pName.startsWith("${") && pName.endsWith("}")) {
            let paramName = pName.substring(2, pName.length - 3);
            route.params.push(
                new RouteParams(paramName, getParamType(route.args[i]))
            );
        }
    }
}

function findRoute(
    signature: string,
    pathRoutes: RouteData[]
): RouteData | undefined {
    let url = new URL(signature);
    let queryStr = new URLSearchParams(url.search);
    if (pathRoutes !== undefined) {
        let keys = Array.from(queryStr.keys()).sort();
        let index = findBestMatchingRoute(pathRoutes, keys);
        if (index === -1) {
            return undefined;
        } else if (
            pathRoutes[index].queryMatches.every(
                (value, index) => value === keys[index]
            )
        ) {
            return pathRoutes[index];
        }
        return undefined;
    }
    return undefined;
}

function initRouting(descriptor: PropertyDescriptor, route: RouteData) {
    let paramsNames = getParamNamesFromMethod(descriptor.value);
    let urlParts = route.raw_url.split("/");
    checkParameterName(paramsNames, urlParts);
    let signature = createUrlSignature(route, urlParts, false);
    if (routes.has(signature))
        throw new Error(
            `The Route url signature already exists: ${signature}.`
        );
    let url = new URL(signature);
    let pathName = url.pathname;
    let queryStr = new URLSearchParams(url.search);
    createRouteMetaData(route, paramsNames);
    let pathRoutes = routes.get(pathName);
    if (pathRoutes !== undefined) {
        let keys = Array.from(queryStr.keys()).sort();
        let index = findBestMatchingRoute(pathRoutes, keys);
        if (index === -1) {
            pathRoutes.push(route);
        } else if (pathRoutes[index].queryMatches.length !== keys.length) {
            pathRoutes.push(route);
        } else if (
            pathRoutes[index].queryMatches.every(
                (value, index) => value === keys[index]
            )
        ) {
            pathRoutes.push(route);
        } else {
            throw new Error(
                "Could not add route, an other routes match the same parameters"
            );
        }
    } else {
        pathRoutes = new Array<RouteData>();
        pathRoutes.push(route);
        routes.set(pathName, pathRoutes);
    }
}

function findBestMatchingRoute(
    routes: RouteData[],
    toFind: Array<string>
): number {
    let maxMatches = 0;
    let bestMatchIndex = -1;

    routes.forEach((item, index) => {
        const matches = item.queryMatches.filter((element) =>
            toFind.includes(element)
        ).length;
        if (matches > maxMatches) {
            maxMatches = matches;
            bestMatchIndex = index;
        }
    });
    return bestMatchIndex;
}

interface CallStack {
    lastDescriptor: PropertyDescriptor;
    firstDescriptor: PropertyDescriptor;
}

function createSharedContext(
    target: any,
    methodName: string,
    descriptor: PropertyDescriptor
): CallStack {
    const key = Symbol(`__${methodName}_context`);
    let curr: CallStack;
    if (!target[key]) {
        curr = { lastDescriptor: descriptor, firstDescriptor: descriptor };
        target[key] = curr;
    } else {
        curr = target[key];
        curr.lastDescriptor = descriptor;
    }
    return target[key];
}

export function HistoryEnabled(enabled: boolean = true) {
    return function (
        target: Controller<AppModel, Layout<LayoutModel>, DomObservableModel>,
        methodName: string,
        descriptor: PropertyDescriptor
    ) {
        let originalMethod = descriptor.value;
        const callStack = createSharedContext(target, methodName, descriptor);
        let route: RouteData = createRoute(target, methodName, descriptor);
        route.history = enabled;
        descriptor.value = function (
            ...args: Array<string | bigint | number | QueryParameter>
        ) {
            let returnVal: any;
            route.args = args;
            if (this.initialized === undefined) {
                this.route = route;
                this.initialized = true;
                if (originalMethod === callStack.lastDescriptor.value)
                    initRouting(descriptor, route);
            }
            if (dispatchRouting(originalMethod, callStack, route) === -1)
                return;
            returnVal = originalMethod.apply(this, args);
            return returnVal;
        };
    };
}
// by default controller method will match all query parameters
export function Query(matches: string[]) {
    return function (
        target: Controller<AppModel, Layout<LayoutModel>, DomObservableModel>,
        methodName: string,
        descriptor: PropertyDescriptor
    ) {
        let originalMethod = descriptor.value;
        const callStack = createSharedContext(target, methodName, descriptor);
        let route: RouteData = createRoute(target, methodName, descriptor);
        route.queryMatches = matches;
        descriptor.value = function (
            ...args: Array<string | bigint | number | QueryParameter>
        ) {
            route.args = args;
            if (this.initialized === undefined) {
                route.queryParams = args.find((value) => {
                    return value instanceof QueryParameter;
                }) as QueryParameter;
                this.route = route;
                this.initialized = true;
                if (originalMethod === callStack.lastDescriptor.value)
                    initRouting(descriptor, route);
            }
            if (dispatchRouting(originalMethod, callStack, route) === -1)
                return;
            let returnVal = originalMethod.apply(this, args);
            return returnVal;
        };
    };
}

function dispatchRouting(
    originalMethod: any,
    callStack: CallStack,
    route: RouteData
): number {
    if (originalMethod === callStack.lastDescriptor.value) {
        let buildUrl = Router.buildRoute(route);
        let currentUrl = Url.normalize(Url.getCurrentUrl(), {
            removeTrailingSlash: false,
            deduplicateParams: true,
            returnAbsolute: false,
            includeQueryParams: true
        });
        // Cancel the call stack and change the url, the rest will be handled automatically.
        if (buildUrl !== currentUrl) {
            if (route.history) history.pushState(route, "", buildUrl);
            else history.replaceState(route, "", buildUrl);
            return -1;
        }
    }
    return 0;
}

// url: the base url to match such as /user/${id}/details/ without query parameters.
// addToHistory: whether you wish the url to be added to the browser history.
// matchingQueryParams: the query parameters that will match this controller method.
// matchingQueryParams: by default all query parameters "*" should match ex: ?filtername=mathieu&lang=en ect...
export function Route(url: string) {
    return function (
        target: Controller<AppModel, Layout<LayoutModel>, DomObservableModel>,
        methodName: string,
        descriptor: PropertyDescriptor
    ) {
        url = url.trim();
        if (Url.hasQueryParams(url))
            throw new Error("Route should not include any query parameters.");
        if (url.length == 0)
            throw new Error(
                "Route Path should not be empty, use '/' for home!"
            );
        let originalMethod = descriptor.value;
        const callStack = createSharedContext(target, methodName, descriptor);
        let route: RouteData = createRoute(target, methodName, descriptor);
        url = Url.normalize(url, {
            removeTrailingSlash: false,
            deduplicateParams: true,
            returnAbsolute: false,
            includeQueryParams: false
        });
        route.raw_url = url;
        descriptor.value = function (
            ...args: Array<string | bigint | number | QueryParameter>
        ) {
            route.args = args;
            if (this.initialized === undefined) {
                this.route = route;
                this.initialized = true;
                if (originalMethod === callStack.lastDescriptor.value)
                    initRouting(descriptor, route);
            }
            if (dispatchRouting(originalMethod, callStack, route) === -1)
                return;
            return originalMethod.apply(this, args);
        };
    };
}

export class Url {
    public static hasQueryParams(url: string): boolean {
        const objUrl = new URL(url, window.location.origin);
        const params = Array.from(objUrl.searchParams.entries());
        if (params.length > 0) return true;
        return false;
    }
    // options:  removeTrailingSlash: false, deduplicateParams: true,
    // returnAbsolute: false, includeQueryParams: true
    public static normalize(
        url: string,
        options: NormalizeUrlOptions = {
            removeTrailingSlash: false,
            deduplicateParams: true,
            returnAbsolute: false,
            includeQueryParams: true
        }
    ) {
        const {
            removeTrailingSlash = false,
            deduplicateParams = true,
            returnAbsolute = true,
            includeQueryParams = true
        } = options;

        const normalizedUrl = new URL(url, window.location.origin);
        normalizedUrl.pathname = normalizedUrl.pathname.replace(/\/\/+/g, "/");

        if (
            removeTrailingSlash &&
            normalizedUrl.pathname !== "/" &&
            normalizedUrl.pathname.endsWith("/")
        ) {
            normalizedUrl.pathname = normalizedUrl.pathname.slice(0, -1);
        } else if (
            !removeTrailingSlash &&
            !normalizedUrl.pathname.endsWith("/")
        ) {
            normalizedUrl.pathname += "/";
        }

        if (includeQueryParams) {
            const params = Array.from(normalizedUrl.searchParams.entries());
            const sortedAndDedupedParams = params
                .sort(
                    (a, b) =>
                        a[0].localeCompare(b[0]) || a[1].localeCompare(b[1])
                )
                .reduce((acc, [key, value]) => {
                    if (
                        !deduplicateParams ||
                        !acc.find(
                            ([existingKey, existingValue]) =>
                                existingKey === key && existingValue === value
                        )
                    ) {
                        acc.push([key, value]);
                    }
                    return acc;
                }, []);

            normalizedUrl.search = sortedAndDedupedParams
                .map(
                    ([key, value]) =>
                        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
                )
                .join("&");
        } else {
            normalizedUrl.search = "";
        }

        if (returnAbsolute) {
            return normalizedUrl.toString();
        } else {
            return (
                normalizedUrl.pathname +
                (includeQueryParams ? normalizedUrl.search : "") +
                normalizedUrl.hash
            );
        }
    }

    public static getCurrentUrl(): string {
        return window.location.href;
    }

    public static getCurrentUrlWithoutBaseAddress() {
        return this.normalize(window.location.pathname);
    }

    public static getBaseAddress(): string {
        return window.location.origin;
    }
    public static gotoNoHistory(url: string) {
        window.location.replace(url);
    }
    public static isAbsoluteUrl(url) {
        return url.indexOf("://") > 0 || url.startsWith("//");
    }

    public static isCurrentWebsiteUrl(url) {
        const link = new URL(url);
        return link.origin === window.location.origin;
    }
}

const paramPlaceholder = "::param::";

export class Router {
    static register<
        T extends Controller<AppModel, Layout<LayoutModel>, DomObservableModel>
    >(constructor: Constructor<T>) {
        Container.register(constructor);
    }
    // compare true url with an url signature
    static compareSignature(url: string, signature: string): boolean {
        url = Url.normalize(url, {
            removeTrailingSlash: false,
            deduplicateParams: true,
            returnAbsolute: false,
            includeQueryParams: false
        });
        let signSplits = signature.split("/");
        let urlSplits = url.split("/");
        if (urlSplits.length != signSplits.length) return false;
        let i = 0;
        for (let i = 0; i < signSplits.length; i++) {
            if (
                signSplits[i] !== urlSplits[i] &&
                signSplits[i] !== paramPlaceholder
            )
                return false;
            i++;
        }
        return true;
    }
    private static _regex = /\$\{|\}/;

    // get route from unparsed string ex: /user/${id} and args = [id:3]
    static buildRoute(route: RouteData): string {
        let urlParts = route.raw_url.split(this._regex);
        let url = "";
        let argIndex = 0;
        if (urlParts.length > 1) {
            for (let i = 0; i < urlParts.length; i += 2) {
                url += urlParts[i];
                if (argIndex < route.args.length) url += route.args[argIndex];
                argIndex++;
            }
        } else url = urlParts[0];
        let queryParams = route.queryParams;
        if (queryParams !== undefined) {
            let i = 0;
            queryParams.forEach((key, value) => {
                if (i === 0) url += `?${key}=${value}`;
                else url += `&${key}=${value}`;
            });
        }
        url = Url.normalize(url, {
            removeTrailingSlash: false,
            deduplicateParams: true,
            returnAbsolute: false,
            includeQueryParams: true
        });
        return url;
    }
    // No absolute url here, should be relative ex: /user/2/
    static navigate(strings, ...values) {
        let args: any[] = [];
        if (strings.length === 0)
            throw new Error("Invalid route navigation url.");
        let signature: string = "";
        if (strings === 1) signature = strings[0];
        else {
            signature = strings.reduce((acc, current, i) => {
                args.push(`${values[i]}`);
                return `${acc}${current}${paramPlaceholder}`;
            }, "");
        }
        signature = Url.normalize(signature);
        let url = new URL(signature);
        let urlpath = url.pathname;
        let query = new URLSearchParams(url.search);
        let routesData = routes.get(signature);
        if (!routesData)
            throw new Error("No route found for signature: " + signature);
        let route = findRoute(signature, routesData);
        let i = 0;
        route.params.forEach((p) => {
            if (p.type === "number") args[i] = Number(args[i]);
            else if (p.type === "bigint") args[i] = BigInt(args[i]);
            else if (p.type === "string") args[i] = String(args[i]);
            i++;
        });
        if (route.controller.app.active_layout !== route.controller.layout)
            route.controller.app.active_layout = route.controller.layout;
        Router.invokeDynamicControllerMethod(
            route.controller.constructor.name,
            route.methodName,
            route.args
        );
    }

    static invokeDynamicControllerMethod(
        className: string,
        methodName: string,
        ...args: any[]
    ): void {
        const instance = controllerInstances.get(className);
        if (!instance)
            throw new Error(`Instance not found for class name: ${className}`);
        const method = instance[methodName];
        if (typeof method !== "function")
            throw new Error(
                `Method ${methodName} not found on instance of ${className}`
            );
        return method.apply(instance, args);
    }

    private static _suspendNav = false;

    static get suspendNav(): boolean {
        return this._suspendNav;
    }
}

window.addEventListener("popstate", function (e) {
    if (e.state && e.state instanceof RouteData) {
        let route = e.state;
        if (route.controller.app.active_layout !== route.controller.layout)
            route.controller.app.active_layout = route.controller.layout;
        Router.invokeDynamicControllerMethod(
            route.controller.constructor.name,
            route.methodName,
            route.args
        );
    } else throw new Error("Unexpected state: " + e.state);
});

document.addEventListener("click", (e) => {
    const target = e.target as HTMLAnchorElement;
    if (target.tagName === "A") {
        e.preventDefault();
        let url = target.getAttribute("href");
        if (Url.isCurrentWebsiteUrl(url)) {
            url = Url.normalize(url, {
                returnAbsolute: false,
                removeTrailingSlash: false,
                includeQueryParams: true
            });
            Router.navigate(url);
        } else {
            // send a warning to the user.
            window.open(url, "_blank");
        }
    }
});
