export function forEachTree<T>(root: any[], callback: (node: any) => void) {
  root.forEach((node) => {
    if (Array.isArray(node.children)) {
      callback(node);
      forEachTree(node.children, callback);
    } else {
      callback(node);
    }
  });
}
