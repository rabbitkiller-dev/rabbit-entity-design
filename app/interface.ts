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
export interface BizTableAttrModel {
  name: string;
  type: string;
  default: string;
  comment: string;
  notNull: boolean;
  autoInc: boolean;
  unique: boolean;
  primaryKey: boolean;
}
export interface BizTableNodeModel extends NodeModel {
  tableName: string;
  attrs: Array<BizTableAttrModel>;
}
