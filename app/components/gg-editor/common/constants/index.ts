export enum ItemType {
  Node = 'node',
  Edge = 'edge'
}

export enum ItemState {
  Active = 'active',
  ActiveAnchorPoints = 'activeAnchorPoints',
  Selected = 'selected',
  HighLight = 'highLight',
  Error = 'error'
}

export enum EditorCommand {
  /** 撤销 */
  Undo = 'undo',
  /** 重做 */
  Redo = 'redo',
  /** 添加 */
  Add = 'add',
  /** 更新 */
  Update = 'update',
  /** 删除 */
  Remove = 'remove',
  /** 复制 */
  Copy = 'copy',
  /** 粘贴 */
  Paste = 'paste',
  /** 粘贴到这里 */
  PasteHere = 'pasteHere',
  /** 放大 */
  ZoomIn = 'zoomIn',
  /** 缩小 */
  ZoomOut = 'zoomOut',
  /** 插入主题 */
  Topic = 'topic',
  /** 插入子主题 */
  Subtopic = 'subtopic',
  /** 收起 */
  Fold = 'fold',
  /** 展开 */
  Unfold = 'unfold'
}


