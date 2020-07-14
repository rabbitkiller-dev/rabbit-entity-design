export interface FileNode {
  key: string;
  path: string;
  title: string;
  ext: string;
  children: FileNode[];
  isDirectory: boolean;
  icon?: JSX.Element;
  isLeaf?: boolean;
}
