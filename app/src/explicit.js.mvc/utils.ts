export function getObjKeys(obj: object | null): Array<string> | null {
    if (obj === null) return null;
    const keysArray: Array<string> = [];
    for (const key in obj) {
        if (Object.getOwnPropertyDescriptor(obj, key)) {
            keysArray.push(key);
        }
    }
    return keysArray;
}

export function getObjValFromPath(
    obj: unknown | null | undefined,
    path: string
): any | null {
    if (obj === null || obj === undefined) return null;
    const keys: string[] = path.split(".");
    keys.forEach((key) => {
		if (isObjectType(obj)) 
			obj = getObjPropValue(obj as object, key);
        if (obj === null || obj === undefined) return obj;
    });
    return obj;
}

export function stringToBoolean(str: string): boolean {
    return str.toLowerCase() === "true";
}

export function setProperty<TObject, TKey extends keyof TObject>(
    obj: TObject,
    propertyName: TKey,
    value: TObject[TKey]
): void {
    obj[propertyName] = value;
}

export function getObjPropValue(
    obj: object | null | undefined,
    key: string
): unknown | null {
    if (obj === null || obj == undefined) return null;
    const descriptor = Object.getOwnPropertyDescriptor(obj, key);
    if (descriptor === undefined)
        throw new Error("Error: property '" + key + "' does not exist.");
    if (descriptor) {
        return descriptor.value;
    }
    return null;
}

function getValueByKey(path: string, obj: any): any {
    const parts = path.match(/(\w+)|(\[\d+\])/g) || [];
    let current = obj;

    try {
        for (const part of parts) {
            if (part.startsWith("[")) {
                const index = parseInt(part.slice(1, -1), 10);
                current = current[index];
            } else {
                current = current[part];
            }
            if (current === undefined) {
                console.log(`Property not found: ${part}`);
                return undefined;
            }
        }
    } catch (error) {
        console.error(`Error accessing path "${path}": ${error}`);
        return undefined;
    }

    return current;
}

// export function getObjPathValue(obj: object | null, keyPath: string): object | null | undefined {
// 	if (obj === null) return null;
// 	const keys: string[] = keyPath.split('.');
// 	keys.forEach(key => {
// 		const index: number = key.indexOf('[');
// 		if (index === -1)

// 	});
// 	const descriptor = Object.getOwnPropertyDescriptor(obj, key);
// 	if (descriptor) {
// 		return descriptor.value;
// 	}
// 	return null;
// };

export function getPropType(obj: object | null, key: string): string | null {
    if (obj === null) return null;
    const descriptor = Object.getOwnPropertyDescriptor(obj, key);
    if (descriptor) return typeof descriptor.value;
    return null;
}

export function nameOf(object: object): string {
    return object.constructor.name;
}

export function getArrayKeys(
    array: Array<object> | null
): Array<string> | null {
    if (array === null) return null;
    const keysArray: Array<string> = [];
    if (array.length > 0) {
        for (const key in array[0]) {
            if (Object.getOwnPropertyDescriptor(array[0], key)) {
                keysArray.push(key);
            }
        }
    }
    return keysArray;
}

export function findIndexByReference<T>(arr: Array<T>, obj: T): number {
    return arr.findIndex((item) => item === obj);
}

export function removeByReference<T>(arr: Array<T>, obj: T): void {
    const index = findIndexByReference(arr, obj);
    if (index !== -1) {
        arr.splice(index, 1);
    }
}

export function isObjectType(value: any): boolean {
    return (
        (typeof value === "object" && value !== null)
    );
}

export function isPrimitive(
    value: any,
    includeUndefined: boolean = true
): boolean {
    return (
        typeof value === "number" ||
        typeof value === "string" ||
        typeof value === "boolean" ||
        typeof value === "symbol" ||
        typeof value === "bigint" ||
        value === null ||
        (includeUndefined && typeof value === "undefined")
    );
}
