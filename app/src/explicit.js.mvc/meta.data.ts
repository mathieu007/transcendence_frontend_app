interface MethodParameterMetadata {
    name: string;
    types: Array<
        | "string"
        | "number"
        | "boolean"
        | "object"
        | "class"
        | "array"
        | "bigint"
        | "null"
        | "undefined"
    >;
    classType: Function | undefined;
	extends: MethodParameterMetadata[] | undefined;
    required: boolean;
	generics: MethodParameterMetadata[] | undefined;
}

interface MethodMetadata {
    methodName: string;
    parameters: MethodParameterMetadata[];
}

interface ClassMetadata {
    className: string;
    methods: MethodMetadata[];
}

const metadataRegistry: Map<string, ClassMetadata> = new Map();

class Product 
{
	id:number;
	name:string;
}

class Orders
{
	id: number;
	products:Map<number, Product>;
}

class User {
    id: number;
    name: string;
	orders: Array<Orders>;
}

class UserController {
    getUser(id: number): User {
        return { id: 2, name: "user" } as User;
    }

    @Route("/user/update/${id}")
    updateUser(id: number, user: User): boolean {
        return true;
    }
}

// Manually register metadata for UserController
metadataRegistry.set("UserController", {
    className: "UserController",
    methods: [
        {
            methodName: "getUser",
            parameters: [
                {
                    name: "id",
                    types: ["number"],
                    classType: undefined,
                    required: true,
					generic_parameters:
                }
            ]
        },
        {
            methodName: "updateUser",
            parameters: [
                {
                    name: "id",
                    types: ["number"],
                    classType: undefined,
                    required: true
                },
                {
                    name: "user",
                    types: ["class"],
                    classType: User,
                    required: true
                }
            ]
        }
    ]
});

const typeInfo = User;

function validateAndInvokeMethod(
    className: string,
    methodName: string,
    args: any[]
): any {

    const classMeta = metadataRegistry.get(className);
    if (!classMeta) throw new Error(`Class ${className} not found`);

    const methodMeta = classMeta.methods.find(
        (m) => m.methodName === methodName
    );
    if (!methodMeta)
        throw new Error(`Method ${methodName} not found in class ${className}`);
	
	const instance = serviceLocator.get<any>(className);
    methodMeta.parameters.forEach((paramMeta, index) => {
        const arg = args[index];

		if (arg === undefined && paramMeta.types.find(() => "undefined") === undefined) {
			throw new Error(`argument ${paramMeta.name} cannot be undefined.`);
        } else if (paramMeta.types.find(() => "class") && !(instance instanceof paramMeta.classType)) {
			throw new Error(`class is not of type: ${paramMeta.classType.name}.`);
        } else if (paramMeta.types.find(() => "array")) {
			if (!(instance instanceof Array))
                throw new Error(`argument is not of type: Array.`);
			else if ()
			{
				
			}
        }
    });

    return instance[methodName](...args);
}
