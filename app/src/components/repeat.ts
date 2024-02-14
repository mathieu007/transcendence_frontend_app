// import { Component } from '../../../explicit.js.mvc/src/component';

// export class RepeatComponent<T extends object> extends Component<T> {
// 	constructor() {
// 		super();
// 		this._htmlTagName = "x-repeat";
// 		this.template = "";
// 		this._keysValues = new Map<string, any>();
// 		this._inAttribute = "";
// 		this._outAttribute = "";
// 	}
// 	private _keysValues: Map<string, any>;
// 	private _inAttribute: string;
// 	private _outAttribute: string;

// 	get inAttributeValue(): string {
// 		return this._inAttribute;
// 	};
// 	get outAttributeValue(): string {
// 		return this._outAttribute;
// 	};

// 	private _parsePlaceHolder(placeHolder: string): void {

// 	}

// 	private _parsePlaceholder(): void {
// 		const children = this.children;
// 		for (let i = 0; i < children.length; i++) {
// 			const child = children[i];
// 			let start = 0;
// 			while (true) {
// 				start = child.outerHTML.indexOf("${", start);
// 				if (start === -1)
// 					break;
// 				start += 2;
// 				const end = child.outerHTML.indexOf("}", start);
// 				if (end === -1)
// 					break;
// 				const placeHolder = child.outerHTML.substring(start, end);
// 			}
// 		}
// 	}

// 	private parse(): void {
// 		const inKey = this.getAttributeNode("in")?.value;
// 		const outKey = this.getAttributeNode("out")?.value;
// 		if (inKey === undefined || inKey === "" || outKey === undefined || outKey === "")
// 			throw new Error("Error you need to specify a repeat attribute ex: in='data' out='item'.");
// 		if (!(inKey in this))
// 			throw new Error("Error you have specified an invalid 'in' key, the key does not exist.");
// 		const children = this.children;

// 		for (let i = 0; i < children.length; i++) {
// 			const child = children[i];
// 			let start = 0;
// 			while (true) {
// 				start = child.outerHTML.indexOf("${", start);
// 				if (start === -1)
// 					break;
// 				start += 2;
// 				const end = child.outerHTML.indexOf("}", start);
// 				if (end === -1)
// 					break;
// 				const placeHolder = child.outerHTML.substring(start, end);
// 			}
// 		}
// 	}

// 	protected repeat<U>(inData: Array<U>, outVar: string) {
// 		const repeats = this.querySelectorAll('repeat');
// 		for (let i = 0; i < repeats.length; i++) {
// 			const repeat = repeats[i];
// 			if (!repeat?.hasAttribute("in") || !repeat.hasAttribute("out"))
// 				throw new Error("Error you need to specify a repeat attribute ex: in='data' out='item'.");
// 			if (repeat) {
// 				const inKey = repeat.getAttributeNode("in")?.value;
// 				const outKey = repeat.getAttributeNode("out")?.value;
// 				const childs = repeat.children;
// 				// if (!outKey || !(outKey in this))
// 				if (!outKey)
// 					throw new Error("Error: not out key specified.");
// 				if (!inKey || !(inKey in this))
// 					throw new Error("Error you have specified an invalid 'in' key, the key does not exist.");
// 				for (let i = 0; i < childs.length; i++) {
// 					const child = childs[i];
// 					let start = 0;
// 					while (true) {
// 						start = child.outerHTML.indexOf("${", start);
// 						if (start === -1)
// 							break;
// 						start += 2;
// 						const end = child.outerHTML.indexOf("}", start);
// 						if (end === -1)
// 							break;
// 						const placeHolder = child.outerHTML.substring(start, end);

// 					}
// 				}
// 			}
// 		}
// 	}

// 	protected render(): void {
// 		const repeats = this.querySelectorAll('repeat');
// 		for (let i = 0; i < repeats.length; i++) {
// 			const repeat = repeats[i];
// 			if (!repeat?.hasAttribute("in") || !repeat.hasAttribute("out"))
// 				throw new Error("Error you need to specify a repeat attribute ex: in='data' out='item'.");
// 			if (repeat) {
// 				const inKey = repeat.getAttributeNode("in")?.value;
// 				const outKey = repeat.getAttributeNode("out")?.value;
// 				const childs = repeat.children;
// 				// if (!outKey || !(outKey in this))
// 				if (!outKey)
// 					throw new Error("Error: not out key specified.");
// 				if (!inKey || !(inKey in this))
// 					throw new Error("Error you have specified an invalid 'in' key, the key does not exist.");
// 				for (let i = 0; i < childs.length; i++) {
// 					const child = childs[i];
// 					let start = 0;
// 					while (true) {
// 						start = child.outerHTML.indexOf("${", start);
// 						if (start === -1)
// 							break;
// 						start += 2;
// 						const end = child.outerHTML.indexOf("}", start);
// 						if (end === -1)
// 							break;
// 						const placeHolder = child.outerHTML.substring(start, end);

// 					}
// 				}
// 			}
// 			// Render content for each item in 'in' data
// 			this._inData.forEach(item => {
// 				const clonedTemplate = document.importNode(template.content, true);
// 				const placeholders = clonedTemplate.querySelectorAll(`.${this._outVariable}`);

// 				placeholders.forEach(placeholder => {
// 					// Replace placeholders with corresponding item properties
// 					placeholder.textContent = item[placeholder.dataset.property || ''];
// 				});

// 				if (container) {
// 					container.appendChild(clonedTemplate);
// 				}
// 			});
// 		}
// 	}
// }
