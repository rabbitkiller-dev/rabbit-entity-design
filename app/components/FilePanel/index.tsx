import { shell } from 'electron';
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FolderFilled } from '@ant-design/icons';
import { FileNode } from '../../interface';
import { RootState } from '../../store';
import { Tree } from '../Tree';
import { forEachTree } from '../../utils/tree';
import DragIcon from '../icons/DragIcon';
import DataSourceIcon from '../icons/DataSourceIcon';
import { Dropdown, Form, Input, Menu, Modal } from 'antd';
import { TreeNodeModel } from '../Tree/tree-node.model';
import { NzFormatEmitEvent } from '../Tree/interface';
import path from 'path';
import { checkFileExists, checkFileName } from '../../features/project';
import { createFile, createFolder } from '../../features/fileSlice';

interface FilePanelProps {
  onShowFile?(fileNode: FileNode): void;
}

export default function FilePanel(props: FilePanelProps) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [currentNode, setCurrentNode] = useState<TreeNodeModel>(null);
  const [newFileDialog, setNewFileDialog] = useState<{ type: string, dir: string }>(null);
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

  /**
   * 新建
   */
  function openNewFile(type: string) {
    let dir = '/';
    if (currentNode) {
      dir = currentNode.isLeaf ? path.dirname(currentNode.key) : currentNode.key;
    }
    setNewFileDialog({ type: type, dir: dir });
  }

  /**
   * 打开文件所在位置
   */
  function openExplorer() {
    if(currentNode){
      const fileNode: FileNode = currentNode.origin;
      shell.showItemInFolder(fileNode.path)
    }

  }

  /**
   * 检查文件名
   */
  function checkFileName({ getFieldValue }) {
    return {
      validator: async (rule, value) => {
        if (!value) {
          return Promise.resolve();
        }
        if (!(await checkFileName(value))) {
          return Promise.reject('文件名有不能使用的符号!');
        }
        if (newFileDialog.type === 'folder') {
          if (await checkFileExists(path.join(newFileDialog.dir, value))) {
            return Promise.reject('文件名重复!');
          }
        } else {
          if (await checkFileExists(path.join(newFileDialog.dir, value + newFileDialog.type))) {
            return Promise.reject('文件名重复!');
          }
        }
        return Promise.resolve();
      },
    };
  }

  function newFile(values) {
    if (newFileDialog.type === 'folder') {
      dispatch(createFolder(path.join(newFileDialog.dir, values.name)));
    } else {
      dispatch(createFile(path.join(newFileDialog.dir, values.name) + newFileDialog.type));
    }
    setNewFileDialog(null);
  }

  const InputIcon = (() => {
    if (!newFileDialog) {
      return null;
    }
    switch (newFileDialog.type) {
      case 'folder':
        return <FolderFilled/>;
      case '.datasource':
        return <DataSourceIcon/>;
      case '.mindmap':
        return <DragIcon/>;
    }
    return null;
  })();
  return (
    <Dropdown overlay={<Menu style={{ minWidth: '150px' }}>
      <Menu.SubMenu title="新建">
        <Menu.Item icon={<DragIcon/>} onClick={() => openNewFile('.mindmap')}>脑图</Menu.Item>
        <Menu.Item icon={<DataSourceIcon/>} onClick={() => openNewFile('.datasource')}>数据库</Menu.Item>
        <Menu.Item icon={<FolderFilled/>} onClick={() => openNewFile('folder')}>文件夹</Menu.Item>
      </Menu.SubMenu>
      <Menu.Item key="3" disabled={true}>重命名</Menu.Item>
      <Menu.Item key="4" disabled={true}>复制</Menu.Item>
      <Menu.Item key="5" disabled={true}>粘贴</Menu.Item>
      <Menu.Item onClick={() => openExplorer()}>打开文件所在位置</Menu.Item>
    </Menu>} trigger={['contextMenu']}>
      <div>
        <Tree data={fileTree} nzDblClick={tree_nzDblClick} nzClick={tree_nzClick}/>
        <Modal
          title="新建"
          visible={!!newFileDialog}
          onOk={() => form.submit()}
          onCancel={() => setNewFileDialog(null)}
        >
          <Form form={form} onFinish={newFile}>
            <Form.Item
              label="名称"
              name="name"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: '请输入名称!',
                },
                checkFileName,
              ]}
            >
              <Input name="name" prefix={InputIcon}/>
            </Form.Item>
          </Form>
        </Modal>
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
      icon: ((file) => {
        if (file.isDirectory) {
          return <FolderFilled/>;
        }
        switch (file.ext) {
          case '.mindmap':
            return <DragIcon/>;
          case '.datasource':
            return <DataSourceIcon/>;
        }
      })(file)
    });
  });
  const fileTree = JSON.parse(JSON.stringify(state.file.fileTree));
  forEachTree(fileTree, (node: FileNode) => {
    node.isLeaf = !node.isDirectory;
    node.icon = ((file) => {
      if (file.isDirectory) {
        return <FolderFilled/>;
      }
      switch (file.ext) {
        case '.mindmap':
          return <DragIcon/>;
        case '.datasource':
          return <DataSourceIcon/>;
      }
      return null;
    })(node);
  });
  return {
    fileMap: fileMap,
    fileTree: fileTree,
  };
}
