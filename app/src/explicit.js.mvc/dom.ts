export type HTMLString = string;

export function insertAt(parent: Node, index: number, newNode: Node): void {
    const referenceNode = parent.childNodes[index] || null;
    parent.insertBefore(newNode, referenceNode);
}

export function insertAfter(targetNode: Node, newNode: Node): void {
    if (targetNode.nextSibling) {
        targetNode.parentNode.insertBefore(newNode, targetNode.nextSibling);
    } else {
        targetNode.parentNode.appendChild(newNode);
    }
}

export function removeAt(parent: Node, index: number): void {
    if (parent.childNodes[index]) {
        parent.removeChild(parent.childNodes[index]);
    }
}

export function replaceElementAtIndex(parent, newIndex, newElement) {
    if (newIndex < 0 || newIndex >= parent.children.length) {
        console.error("Index out of bounds");
        return;
    }
    const oldElement = parent.children[newIndex];

    oldElement.remove();

    if (newIndex >= parent.children.length) {
        parent.appendChild(newElement);
    } else {
        const referenceElement = parent.children[newIndex];
        parent.insertBefore(newElement, referenceElement);
    }
}

export function getChildIndex(node) {
    return Array.prototype.indexOf.call(node.parentNode.children, node);
}

export function existAt(parent: Node, index: number): boolean {
    if (parent.childNodes[index]) {
        return true;
    }
    return false;
}

export function textNodeAtEqual(parent: Node, index: number, textToComapre: string): boolean {
    if (
        parent.childNodes[index] &&
        parent.childNodes[index] instanceof Text &&
        parent.childNodes[index].textContent === textToComapre
    ) {
        return true;
    }
    return false;
}
