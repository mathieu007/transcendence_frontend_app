import type { BaseApp } from "@explicit.js.mvc/base.app.container";
import { Controller } from "@explicit.js.mvc/controller";
import { Container, type Constructor } from "@explicit.js.mvc/di/container";
import type { Layout } from "@explicit.js.mvc/layout";
import type { LayoutModel } from "@explicit.js.mvc/layout.model";
import type { DomObservableModel } from "@explicit.js.mvc/observable";
import type { HeaderModel } from "@explicit.js.mvc/header.model";
import type { Header } from "@explicit.js.mvc/header";
import { isObjectType } from "@explicit.js.mvc/utils";
const redirect404 = "/page_not_found_404.html";

interface NormalizeUrlOptions {
    removeTrailingSlash?: boolean;
    deduplicateParams?: boolean;
    returnAbsolute?: boolean;
    includeQueryParams?: boolean;
}

// routes are url in the form of /user/--param--/list/ ...
const routes: Map<string, Array<RouteData>> = new Map();
const controllerInstances: Map<
    string,
    Controller<BaseApp, Header<HeaderModel>, Layout<LayoutModel>, DomObservableModel>
> = new Map();

class RouteParams {
    constructor(name: string, indexInString: number, type: "string" | "number" | "bigint" | "query") {
        this.name = name;
        this.indexInUrl = indexInString;
        this.type = type;
    }
    public name: string;
    public indexInUrl: number;
    public type: "string" | "number" | "bigint" | "query";
}

class RouteContextData {
    public args: Array<string | number | bigint | QueryParameter> | undefined;
    public queryParams: QueryParameter | undefined;
    public url: string | undefined;
}

const routesByContainer: Map<string, RouteContainer> = new Map();

// unserializable data
class RouteContainer {
    public method: any;
    public callstack: CallStack;
    public controller: Constructor<Controller<BaseApp, Header<HeaderModel>, Layout<LayoutModel>, DomObservableModel>>;
}

class RouteData {

    constructor(data?: Partial<RouteData>) {
        Object.assign(this, data);
    }

    // The url as specified from the Route("myurl") decorator function.
    public raw_url: string;
    public initialized: boolean = false;
    // The signature without query string
    public signature: string;
    // With query string
    public full_signature: string;
    public history: boolean = true;
    // we cannot serialize complex object or recursive one, so we need to store data in map
    public getContainer(): RouteContainer | undefined {
        return routesByContainer.get(this.full_signature);
    }
    public newContainer(key: string): RouteContainer {
        let cont = new RouteContainer();
        routesByContainer.set(key, cont);
        return cont;
    }
    // The query as specified by the Query(["page", "search"]) decorator function
    public queryMatches: string[] | undefined;
    public methodParams: Array<RouteParams>;
    public context: RouteContextData;
    public methodName: string;
}

export class QueryParameter {
    [key: string]: string | QueryParameter | bigint | number | Function | Array<string | QueryParameter>;

    constructor(initialValues: { [key: string]: any } = {}) {
        Object.entries(initialValues).forEach(([key, value]) => {
            this[key] = value;
        });
    }

    // forEach(callback: (key: string, value: any) => void): void {
    //     Object.entries(this).forEach(([key, value]) => {
    //         callback(key, value);
    //     });
    // }
}

function getParamNamesFromMethod(func: Function) {
    const fnStr = func.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm, "");
    let result = fnStr.slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")")).match(/([^\s,]+)/g);
    let strs: string[] = [];
    if (result) {
        result.forEach((val, index) => {
            strs.push(val.trim());
        });
    }
    return result === null ? [] : strs;
}

function createOrGetRoute(target: any, callStack: CallStack, methodName: string, method: any) {
    let route: RouteData;
    if (callStack.lastMethod.route === undefined) {
        route = new RouteData();
        route.context = new RouteContextData();
        route.methodName = methodName;
        route.methodParams = new Array();
    } else {
        route = callStack.lastMethod.route;
    }
    method.route = route;
    return route;
}

function checkParameterName(methodParamsNames: string[], urlsParts: string[]) {
    let urlParameters = getParameters(urlsParts);
    for (let i = 0; i < urlParameters.length; i++) {
        if (methodParamsNames.indexOf(urlParameters[i]) === -1)
            throw new Error("Route contains unexisting parameters in method.");
    }
}

function getParametersNameFromRawUrl(route: RouteData): string[] {
    let urlParts = route.raw_url.split("/");
    return getParameters(urlParts);
}

function getParameters(urlParts: string[]): string[] {
    let arr: string[] = [];
    for (let i = 0; i < urlParts.length; i++) {
        let url = urlParts[i].trim();
        if (url.startsWith("${") && url.endsWith("}")) {
            let param = url
                .substring(2)
                .substring(0, url.length - 3)
                .trim();
            arr.push(param);
        }
    }
    return arr;
}

function countUrlParts(urlsParts: string[]): number {
    let count = 0;
    if (urlsParts.length === 0) return 0;
    urlsParts.forEach(e => {
        if (e.trim() !== "")
            count++;
    });
    if (count === 0)
        count = 1;
    return count;
}

function recursiveGetMatchingUrlFromMap(
    urlParts: string[],
    concatPathName: string,
    matches: Array<RouteData>
): Array<RouteData> | undefined {
    let partsCount = countUrlParts(urlParts);
    let pI = 0;
    for (pI = 0; pI < partsCount; pI++) {
        let elem = urlParts[pI];
        let p = elem.trim();
        let currentUrl = concatPathName + "/" + p;
        for (let [pathName, routeArr] of routes) {
            if (pathName.startsWith(currentUrl)) {
                for (var i = 0; i < routeArr.length; i++) {
                    let route = routeArr[i];
                    matches.push(route);
                    if (pathName === currentUrl && partsCount === 1) {
                        return matches;
                    }
                }
            }
            if (matches.length === 0) {
                currentUrl = concatPathName + "/" + paramPlaceholder;
                for (let [pathName, routeArr] of routes) {
                    if (pathName.startsWith(currentUrl)) {
                        for (var i = 0; i < routeArr.length; i++) {
                            let route = routeArr[i];
                            matches.push(route);
                            if (pathName === currentUrl && partsCount === 1) {
                                return matches;
                            }
                        };
                    }
                }
            }
            if (matches.length === 0) return undefined;
            urlParts = urlParts.splice(0, 1);
            if (urlParts.length === 0)
                return matches;
            if (urlParts.length === 1 && urlParts[0].trim() === "")
                return matches;
            return recursiveGetMatchingUrl(urlParts, concatPathName, matches);
        }
        return [];
    }
}

function recursiveGetMatchingUrl(
    urlParts: string[],
    concatPathName: string,
    matches: Array<RouteData>
): Array<RouteData> | undefined {
    let matches2: Array<RouteData> = [];
    let partsCount = countUrlParts(urlParts);
    let pI = 0;
    for (pI = 0; pI < partsCount; pI++) {
        let elem = urlParts[pI];
        let p = elem.trim();
        let currentUrl = concatPathName + "/" + p;
        for (let route of matches) {
            if (route.signature.startsWith(currentUrl)) {
                matches2.push(route);
            }
        }
        if (matches2.length === 0) {
            currentUrl = concatPathName + "/" + paramPlaceholder;
            for (let route of matches) {
                if (route.signature.startsWith(currentUrl)) {
                    matches2.push(route);
                }
            };
        }
        if (matches2.length === 0) return undefined;
        urlParts = urlParts.splice(0, 1);
        if (urlParts.length === 0) {
            return matches2;
        }
        return recursiveGetMatchingUrl(urlParts, currentUrl, matches2);
    }
    return matches2;
}

// !important, without base address...
function tryGetMatchingRoute(urlPathName: string): RouteData | undefined {
    let urlParts = urlPathName.split("/",);
    let concatPathName = "";
    let matches: Array<RouteData> = new Array();
    matches = recursiveGetMatchingUrlFromMap(urlParts, concatPathName, matches);
    if (!matches || matches.length === 0) return undefined;
    if (matches.length > 0) {
        let route = findRoute(matches[0].signature, matches);
        if (!route) return undefined;
        return route;
    }
    return undefined;
}

function createUrlSignature(route: RouteData, urlParts: string[], withQueryParams: boolean): string {
    let signature = "/";
    urlParts.forEach((elem) => {
        let p = elem.trim();
        if (p !== "") {
            if (p.startsWith("${") && p.endsWith("}")) signature += `${paramPlaceholder}/`;
            else signature += p + "/";
        }
    });
    if (withQueryParams) {
        if (route.queryMatches !== undefined) {
            route.queryMatches.sort();
            if (route.queryMatches.length > 0) signature += `?${route.queryMatches[0]}=0`;
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

function getParamType(p: any, route: RouteData): "string" | "number" | "bigint" | "query" {
    let type: "string" | "number" | "bigint" | "query";
    if (isObjectType(p)) type = "query";
    else if (typeof p === "string") type = "string";
    else if (typeof p === "number") type = "number";
    else if (typeof p === "bigint") type = "bigint";
    else {
        throw new Error(
            `Parameter is not a valid parameter type in one of your controller method: ${route.getContainer().controller.name}.${route.methodName}.`
        );
    }
    return type;
}

function createRouteParamsTypeMetaData(route: RouteData, funcParamsNames: string[]) {
    let parts = route.raw_url.split("/");
    let params: string[] = [];
    parts.forEach((value, index) => {
        if (value.startsWith("${") && value.endsWith("}")) {
            let v = value.substring(2, value.length - 1);
            params.push(v);
        }
    });
    for (let i = 0; i < funcParamsNames.length; i++) {
        let pName = funcParamsNames[i];
        let foundIndex = params.findIndex((value) => {
            return value === pName;
        });
        route.methodParams.push(new RouteParams(pName, foundIndex, getParamType(route.context.args[i], route)));
    }
}

function findRoute(signature: string, pathRoutes: RouteData[]): RouteData | undefined {
    let url = new URL(signature, Url.getBaseAddress());
    let queryStr = new URLSearchParams(url.search);
    if (pathRoutes !== undefined) {
        let keys = Array.from(queryStr.keys()).sort();
        if (keys.length === 0)
            return pathRoutes[0];
        let index = findBestMatchingRoute(pathRoutes, keys);
        if (index === -1) {
            return undefined;
        } else if (pathRoutes[index].queryMatches.some((value, index) => value === keys[index])) {
            return pathRoutes[index];
        }
        return undefined;
    }
    return undefined;
}

function buildQueryMatches(arr: string[]): string {
    let url = "";
    if (arr !== undefined) {
        let i = 0;
        arr.forEach((value) => {
            if (i === 0) url += `?${value}=0`;
            else url += `&${value}=0`;
            i++;
        });
    }
    return url;
}

function initRouting(target: any, callStack: CallStack, route: RouteData, originalMethod: any) {
    let paramsNames = getParamNamesFromMethod(callStack.lastMethod);
    let urlParts = route.raw_url.split("/");
    checkParameterName(paramsNames, urlParts);
    let signature = createUrlSignature(route, urlParts, false);
    route.signature = signature;
    let baseUrl = Url.getBaseAddress();
    let url = new URL(signature + buildQueryMatches(route.queryMatches), baseUrl);
    route.full_signature = url.pathname + url.search;
    let routeContainer = route.getContainer();
    if (!routeContainer) routeContainer = route.newContainer(route.full_signature);
    routeContainer.callstack = callStack;
    routeContainer.controller = target.constructor;
    routeContainer.method = callStack.firstMethod;
    let pathName = url.pathname;
    let queryStr = new URLSearchParams(url.search);
    let pathRoutes = routes.get(pathName);
    if (pathRoutes !== undefined) {
        let queryKeys = Array.from(queryStr.keys()).sort();
        if (queryKeys.length === 0) {
            pathRoutes.push(route);
            return;
        }
        let index = findBestMatchingRoute(pathRoutes, queryKeys);
        if (index === -1) {
            pathRoutes.push(route);
        } else if (pathRoutes[index].queryMatches.length !== queryKeys.length) {
            pathRoutes.push(route);
        } else if (pathRoutes[index].queryMatches.every((value, index) => value === queryKeys[index])) {
            pathRoutes.push(route);
        } else {
            throw new Error("Could not add route, an other routes match the same parameters");
        }
    } else {
        pathRoutes = new Array<RouteData>();
        pathRoutes.push(route);
        routes.set(pathName, pathRoutes);
    }
}

function findBestMatchingRoute(routes: RouteData[], toFind: Array<string>): number {
    let maxMatches = 0;
    let bestMatchIndex = -1;
    if (toFind.length === 0)
        return 0;
    routes.forEach((item, index) => {
        const matches = item.queryMatches.filter((element) => toFind.includes(element)).length;
        if (matches > maxMatches) {
            maxMatches = matches;
            bestMatchIndex = index;
        }
    });
    return bestMatchIndex;
}

interface CallStack {
    descriptors: any[];
    lastMethod: any;
    firstMethod: any;
    initialized: boolean;
}

function createSharedContext(target: any, methodName: string, method: any): CallStack {
    const key = Symbol.for(`__${target.constructor.name}__${methodName}_context`);
    let curr: CallStack = target[key];
    if (!curr) {
        curr = { lastMethod: method, firstMethod: method, descriptors: [], initialized: false };
        curr.descriptors.push(method);
        target[key] = curr;
    } else {
        curr.firstMethod = method;
        curr.descriptors.push(method);
    }
    return target[key];
}

export function HistoryEnabled(enabled: boolean = true) {
    let func = function (
        target: Controller<BaseApp, Header<HeaderModel>, Layout<LayoutModel>, DomObservableModel>,
        methodName: string,
        descriptor: PropertyDescriptor
    ) {
        checkIfIsController(target);
        let originalMethod = descriptor.value;
        const callStack = createSharedContext(target, methodName, originalMethod);
        let route: RouteData = createOrGetRoute(target, callStack, methodName, originalMethod);
        route.history = enabled;
        if (decorators.length === 1) {
            initRouting(target, callStack, route, originalMethod);
        }
        descriptor.value = function (...args: Array<string | bigint | number | QueryParameter>) {
            let returnVal: any;
            route.context.args = args;
            if (dispatchRouting(this, originalMethod, callStack, route) === -1) return;
            returnVal = originalMethod.apply(this, args);
            return returnVal;
        };
        decorators = decorators.filter((item) => item !== func);
    };
    decorators.push(func);
    return func;
}

let decorators: Array<Function> = new Array();

// by default controller method will match all query parameters
export function Query(matches: string[]) {
    console.log("Matches: " + matches);
    let func = function (target: any, methodName: string, descriptor: PropertyDescriptor) {
        checkIfIsController(target);
        let originalMethod = descriptor.value;
        const callStack = createSharedContext(target, methodName, originalMethod);
        let route: RouteData = createOrGetRoute(target, callStack, methodName, originalMethod);
        route.queryMatches = matches;
        if (decorators.length === 1) {
            initRouting(target, callStack, route, originalMethod);
        }
        descriptor.value = function (...args: Array<string | bigint | number | QueryParameter>) {
            route.context.args = args;
            route.context.queryParams = args.find((value) => {
                return isObjectType(value);
            }) as QueryParameter;
            if (dispatchRouting(this, originalMethod, callStack, route) === -1) return;
            let returnVal = originalMethod.apply(this, args);
            return returnVal;
        };
        decorators = decorators.filter((item) => item !== func);
    };
    decorators.push(func);
    return func;
}

function updateLayoutController(route: RouteData): void {
    let container = route.getContainer();
    let controller = container.controller;
    let app = controller.instance.app;

    if (app.model.active_header !== controller.instance.header || app.model.active_header === undefined) {
        app.model.active_header = controller.instance.header;
        document.head.replaceChildren(...app.globalHeader.childNodes);
        controller.instance.header.element.childNodes.forEach((element) => {
            document.head.appendChild(element);
        });
    }
    if (app.model.active_layout !== controller.instance.layout || app.model.active_layout === undefined) {
        app.model.active_layout = controller.instance.layout;
        document.body.replaceChildren(controller.instance.layout.element);
        controller.instance.layout.insertControllerNode(controller.instance.element);
    }
}

let firstLoad = true;
function dispatchRouting(instance: any, originalMethod: any, callStack: CallStack, route: RouteData): number {
    if (originalMethod === callStack.lastMethod) {
        if (!callStack.initialized) {
            instance.route = route;
            callStack.initialized = true;
            let paramsNames = getParamNamesFromMethod(originalMethod);
            createRouteParamsTypeMetaData(route, paramsNames);
        }
        let buildUrl = Router.buildRoute(route);
        let currentUrl = Url.normalize(Url.getCurrentUrl(), {
            removeTrailingSlash: false,
            deduplicateParams: true,
            returnAbsolute: true,
            includeQueryParams: true
        });
        buildUrl = Url.normalize(buildUrl, {
            removeTrailingSlash: false,
            deduplicateParams: true,
            returnAbsolute: true,
            includeQueryParams: true
        });
        updateLayoutController(route);
        if (buildUrl !== currentUrl || firstLoad) {
            firstLoad = false;
            if (route.history) history.pushState(route, "", buildUrl);
            else history.replaceState(route, "", buildUrl);
            return -1;
        }
    }
    return 0;
}

const controllerRoutes: Map<
    Controller<BaseApp, Header<HeaderModel>, Layout<LayoutModel>, DomObservableModel>,
    Array<RouteData>
> = new Map();

function checkIfIsController(target: any): void {
    let currentPrototype = Object.getPrototypeOf(target);
    let isAbstractController = false;

    while (currentPrototype != null) {
        if (
            currentPrototype.constructor ===
            Controller<BaseApp, Header<HeaderModel>, Layout<LayoutModel>, DomObservableModel>
        ) {
            isAbstractController = true;
            break;
        }
        currentPrototype = Object.getPrototypeOf(currentPrototype);
    }

    if (!isAbstractController) {
        throw new Error("Cannot use Route decorator on non controller methods.");
    }
}

// url: the base url to match such as /user/${id}/details/ without query parameters.
// addToHistory: whether you wish the url to be added to the browser history.
// matchingQueryParams: the query parameters that will match this controller method.
// matchingQueryParams: by default all query parameters "*" should match ex: ?filtername=mathieu&lang=en ect...
export function Route(url: string) {
    let func = function (target: any, methodName: string, descriptor: PropertyDescriptor) {
        checkIfIsController(target);
        url = url.trim();
        if (Url.hasQueryParams(url)) throw new Error(`Route ${url} should not include any query parameters.`);
        if (url.length == 0) throw new Error("Route Path should not be empty, use '/' for home!");
        let originalMethod = descriptor.value;
        const callStack = createSharedContext(target, methodName, originalMethod);
        let route: RouteData = createOrGetRoute(target, callStack, methodName, originalMethod);
        url = Url.addSlashes(url);
        route.raw_url = url;
        if (decorators.length === 1) {
            initRouting(target, callStack, route, originalMethod);
        }
        descriptor.value = function (...args: Array<string | bigint | number | QueryParameter>) {
            route.context.args = args;
            if (dispatchRouting(this, originalMethod, callStack, route) === -1) return;
            return originalMethod.apply(this, args);
        };
        decorators = decorators.filter((item) => item !== func);
    };
    decorators.push(func);
    return func;
}

export class Url {
    public static hasQueryParams(url: string): boolean {
        const objUrl = new URL(url, Url.getBaseAddress());
        const params = Array.from(objUrl.searchParams.entries());
        if (params.length > 0) return true;
        return false;
    }
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

        if (removeTrailingSlash && normalizedUrl.pathname !== "/" && normalizedUrl.pathname.endsWith("/")) {
            normalizedUrl.pathname = normalizedUrl.pathname.slice(0, -1);
        } else if (!removeTrailingSlash && !normalizedUrl.pathname.endsWith("/")) {
            normalizedUrl.pathname += "/";
        }

        if (includeQueryParams) {
            const params = Array.from(normalizedUrl.searchParams.entries());
            const sortedAndDedupedParams = params
                .sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]))
                .reduce((acc, [key, value]) => {
                    if (
                        !deduplicateParams ||
                        !acc.find(([existingKey, existingValue]) => existingKey === key && existingValue === value)
                    ) {
                        acc.push([key, value]);
                    }
                    return acc;
                }, []);

            normalizedUrl.search = sortedAndDedupedParams
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join("&");
        } else {
            normalizedUrl.search = "";
        }

        if (returnAbsolute) {
            return normalizedUrl.toString();
        } else {
            return normalizedUrl.pathname + (includeQueryParams ? normalizedUrl.search : "") + normalizedUrl.hash;
        }
    }

    public static addSlashes(url: string): string {
        if (!url.startsWith("/")) url = "/" + url;
        if (!url.endsWith("/")) url += "/";
        return url;
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
        const link = new URL(url, Url.getBaseAddress());
        return link.origin === window.location.origin;
    }
}

const paramPlaceholder = "--param--";
const _regex = /\$\{|\}/;

export class Router {
    static register<T extends Controller<BaseApp, Header<HeaderModel>, Layout<LayoutModel>, DomObservableModel>>(
        key: string,
        construct: Constructor<T>
    ): T {
        let controller = Container.register(key, construct);
        return controller;
    }

    // static compareSignature(url: string, signature: string): boolean {
    //     url = Url.normalize(url, {
    //         removeTrailingSlash: false,
    //         deduplicateParams: true,
    //         returnAbsolute: false,
    //         includeQueryParams: false
    //     });
    //     let signSplits = signature.split("/");
    //     let urlSplits = url.split("/");
    //     if (urlSplits.length != signSplits.length) return false;
    //     let i = 0;
    //     for (let i = 0; i < signSplits.length; i++) {
    //         if (signSplits[i] !== urlSplits[i] && signSplits[i] !== paramPlaceholder) return false;
    //         i++;
    //     }
    //     return true;
    // }

    static buildQueryParams(q: QueryParameter): string {
        let url = "";
        if (q !== undefined) {
            let i = 0;
            Object.entries(q).forEach(([key, value]) => {
                if (i === 0) url += `?${key}=${value}`;
                else url += `&${key}=${value}`;
                i++;
            });
        }
        return url;
    }

    // get route from unparsed string ex: /user/${id}/ and args = [id:3]
    static buildRoute(route: RouteData): string {
        let urlParts = route.raw_url.split(_regex);
        let url = "";
        let argIndex = 0;
        if (urlParts.length >= 2) {
            for (let i = 0; i < urlParts.length; i += 2) {
                url += urlParts[i];
                if (urlParts.length > i + 1 && !isObjectType(route.context.args[argIndex])) url += route.context.args[argIndex];
                argIndex++;
            }
        } else {
            url = urlParts[0];
        }
        url += this.buildQueryParams(route.context.queryParams);
        url = Url.normalize(url, {
            removeTrailingSlash: false,
            deduplicateParams: true,
            returnAbsolute: false,
            includeQueryParams: true
        });
        return url;
    }

    private static getParametersFromUrl(
        url: string,
        signature: string
    ): Array<string | number | bigint | QueryParameter> {
        let urlParts = url.split("/");
        let args = new Array<string | number | bigint | QueryParameter>();
        let signatureParts = signature.split("/");
        signatureParts.forEach((value, i) => {
            if (value === paramPlaceholder) args.push(urlParts[i]);
        });
        return args;
    }

    // The url is a composed url with query string if it applies...
    static navigate(urlString: string) {
        let options: NormalizeUrlOptions = {
            removeTrailingSlash: false,
            deduplicateParams: true,
            returnAbsolute: false,
            includeQueryParams: true
        };
        urlString = Url.normalize(urlString, options);
        let url = new URL(urlString, Url.getBaseAddress());
        let route = tryGetMatchingRoute(url.pathname);
        let urlArgs = Router.getParametersFromUrl(url.pathname, route.signature);
        let args = new Array<string | number | bigint | QueryParameter>();
        let i = 0;
        let urlSearch = new URLSearchParams(url.search);
        let q = new QueryParameter();
        urlSearch.forEach((value, key) => {
            q[key] = value;
        });
        route.context.queryParams = q;
        route.methodParams.forEach((p, i) => {
            let urlIndex = p.indexInUrl;
            if (p.type === "number") args.push(Number(urlArgs[urlIndex]));
            else if (p.type === "bigint") args.push(BigInt(urlArgs[urlIndex].toString()));
            else if (p.type === "string") args.push(String(urlArgs[urlIndex]));
            else if (p.type === "query") args.push(q);
            i++;
        });
        route.context.args = args;
        dispatchRoute(route);
    }

    static invokeDynamicControllerMethod(instance: any, methodName: string, args: (string | number | bigint | QueryParameter)[]): void {
        const method = instance[methodName];
        if (typeof method !== "function") throw new Error(`Method ${methodName} not found on instance of ${instance.constructor.name}`);
        return method.apply(instance, args);
    }

    private static _suspendNav = false;

    static get suspendNav(): boolean {
        return this._suspendNav;
    }
}

function dispatchRoute(route: RouteData): void {
    updateLayoutController(route);
    let controller = route.getContainer().controller;
    Router.invokeDynamicControllerMethod(controller.instance, route.methodName, route.context.args);
}

window.addEventListener("popstate", function (e) {
    if (e.state) {
        let route = new RouteData(e.state);
        dispatchRoute(route);
    } else throw new Error("Unexpected state: " + e.state);
});

document.addEventListener("click", (e) => {
    const target = e.target as HTMLAnchorElement;
    if (target.tagName === "A") {
        e.preventDefault();
        let url = target.getAttribute("href");
        if (Url.isCurrentWebsiteUrl(url)) {
            url = Url.normalize(url, {
                returnAbsolute: true,
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
