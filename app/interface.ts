import { NodeModel } from 'gg-editor/lib/common/interfaces';

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
export interface BizTableNodeModel extends NodeModel {
  tableName: string;
  attrs: Array<{ name: string }>;
}
