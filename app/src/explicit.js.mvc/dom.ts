function insertAt(parent: Node, index: number, newNode: Node): void {
  const referenceNode = parent.childNodes[index] || null;
  parent.insertBefore(newNode, referenceNode);
}

function removeAt(parent: Node, index: number): void {
  if (parent.childNodes[index]) {
    parent.removeChild(parent.childNodes[index]);
  }
}

function existAt(parent: Node, index: number): boolean {
  if (parent.childNodes[index]) {
    return true;
  }
  return false;
}

function textNodeAtEqual(
  parent: Node,
  index: number,
  textToComapre: string
): boolean {
  if (
    parent.childNodes[index] &&
    parent.childNodes[index] instanceof Text &&
    parent.childNodes[index].textContent === textToComapre
  ) {
    return true;
  }
  return false;
}
