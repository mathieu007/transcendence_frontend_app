function insertAt(parent: Node, index: number, newNode: Node): void {
    const referenceNode = parent.childNodes[index] || null;
    parent.insertBefore(newNode, referenceNode);
}

function removeAt(parent: Node, index: number): void {
    if (parent.childNodes[index]) {
        parent.removeChild(parent.childNodes[index]);
    }
}

function replaceElementAtIndex(parent, newIndex, newElement) {
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

function getChildIndex(node) {
    return Array.prototype.indexOf.call(node.parentNode.children, node);
}

function existAt(parent: Node, index: number): boolean {
    if (parent.childNodes[index]) {
        return true;
    }
    return false;
}

function textNodeAtEqual(parent: Node, index: number, textToComapre: string): boolean {
    if (
        parent.childNodes[index] &&
        parent.childNodes[index] instanceof Text &&
        parent.childNodes[index].textContent === textToComapre
    ) {
        return true;
    }
    return false;
}
