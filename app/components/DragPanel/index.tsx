import React, {useState} from 'react';
import { FileNode } from '../../interface';

interface FileTree extends FileNode {
  icon: JSX.Element;
  children: FileTree[];
}

interface ModelEditorProps {
}

export default function DragPanel(props: ModelEditorProps) {
  return (
<div>DragPanel</div>
  );
}

