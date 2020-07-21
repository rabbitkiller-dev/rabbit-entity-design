import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FolderFilled } from '@ant-design/icons';
import { FileNode } from '../../interface';
import { RootState } from '../../store';
import { Tree } from '../Tree';
import { forEachTree } from '../../utils/tree';
import DragIcon from '../icons/DragIcon';
import { Dropdown, Menu } from 'antd';
import { TreeNodeModel } from '../Tree/tree-node.model';
import { NzFormatEmitEvent } from '../Tree/interface';
import fs from 'fs';

interface FilePanelProps {
  onShowFile?(fileNode: FileNode): void;
}

export default function FilePanel(props: FilePanelProps) {
  const [currentNode, setCurrentNode] = useState<TreeNodeModel>(null);
  const { fileTree, fileMap } = useSelector(mapStateFileTree);

  /**
   * 点击树节点获取当前选中节点
   */
  function tree_nzClick($event: NzFormatEmitEvent) {
    setCurrentNode($event.node);
  }

  /**
   * 双击树节点 打开文件/展开文件
   */
  function tree_nzDblClick($event: NzFormatEmitEvent) {
    if (!$event.node.isLeaf) {
      $event.node.isExpanded = !$event.node.isExpanded;
    } else {
      props.onShowFile && props.onShowFile($event.node.origin);
    }
  }

  return (
    <Dropdown overlay={<Menu style={{ minWidth: '150px' }}>
      <Menu.SubMenu title="新建">
        <Menu.Item icon={<DragIcon/>}>数据库UML</Menu.Item>
        <Menu.Item icon={<FolderFilled/>}>文件夹</Menu.Item>
      </Menu.SubMenu>
      <Menu.Item key="2" disabled={true}>上传</Menu.Item>
      <Menu.Item key="3" disabled={true}>重命名</Menu.Item>
      <Menu.Item key="4" disabled={true}>复制</Menu.Item>
      <Menu.Item key="5" disabled={true}>粘贴</Menu.Item>
    </Menu>} trigger={['contextMenu']}>
      <div>
        <Tree data={fileTree} nzDblClick={tree_nzDblClick} nzClick={tree_nzClick}/>
      </div>
    </Dropdown>
  );
}

function mapStateFileTree(state: RootState): { fileTree: FileNode[], fileMap: { [index: string]: FileNode } } {
  const fileNode: FileNode[] = [];
  const fileMap: { [index: string]: FileNode } = {};
  Object.keys(fileMap).forEach((key) => {
    const file = fileMap[key];
    fileNode.push({
      ...file,
      children: [],
      // @ts-ignore
      icon: ((ext) => {
        switch (ext) {
          case '.mindmap':
            return <DragIcon/>;
          case 'folder':
            return <FolderFilled/>;
        }
      })(file.ext)
    });
  });
  const fileTree = JSON.parse(JSON.stringify(state.file.fileTree));
  forEachTree(fileTree, (node: FileNode) => {
    node.icon = node.isDirectory ? <FolderFilled/> : <DragIcon/>;
    node.isLeaf = !node.isDirectory;
  });
  return {
    fileMap: fileMap,
    fileTree: fileTree,
  };
}
