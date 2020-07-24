import React from 'react';
import { useSelector, useDispatch, createDispatchHook, connect } from 'react-redux';
import GGEditor, { Flow } from 'gg-editor';
const fs = require('electron').remote.require('fs');
import path from 'path';
import styles from './Editor.less';
import { Tree } from '../components/Tree';
import { NzFormatEmitEvent } from '../components/Tree/interface';
import Icon, { FolderFilled } from '@ant-design/icons';
import { Menu, Dropdown, Modal, Form, Input } from 'antd';
import PropTypes from 'prop-types';
import {
  createFile, createFolder
} from '../features/fileSlice';
import { FileNode } from '../interface';
import { Store } from '../store';
import { TreeNodeModel } from '../components/Tree/tree-node.model';
import { checkFileName, checkFileExists } from '../features/project';
import { FormInstance } from 'antd/lib/form';
import { forEachTree } from '../utils/tree';
import EditorJs from '../components/EdtiorJs/EdtiorJs';

const DragSvg = () => (
  <svg className="icon" viewBox="0 0 1170 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
       p-id="864" width="1em" height="1em">
    <path d="M335.21428584 495.92857168h241.07142832v64.28571416H335.21428584z" fill="#0f9d58" p-id="865"></path>
    <path
      d="M804.5 769.14285752v64.28571416H624.5c-53.03571416 0-96.42857168-43.39285752-96.42857168-96.42857168V303.07142832c0-53.03571416 43.39285752-96.42857168 96.42857168-96.4285708h188.03571416v64.28571416H624.5c-17.67857168 0-32.14285752 14.46428584-32.14285752 32.14285664v433.92857168c0 17.67857168 14.46428584 32.14285752 32.14285752 32.14285752h180z"
      fill="#0f9d58" p-id="866"></path>
    <path
      d="M929.85714248 383.42857168c-88.39285752 0-160.71428584-72.32142832-160.71428496-160.71428584S841.46428584 62 929.85714248 62s160.71428584 72.32142832 160.71428584 160.71428584-72.32142832 160.71428584-160.71428584 160.71428583z m0-257.14285752c-53.03571416 0-96.42857168 43.39285752-96.42857081 96.42857168s43.39285752 96.42857168 96.42857081 96.42857168 96.42857168-43.39285752 96.42857168-96.42857168-43.39285752-96.42857168-96.42857168-96.42857168zM929.85714248 962c-88.39285752 0-160.71428584-72.32142832-160.71428496-160.71428584s72.32142832-160.71428584 160.71428496-160.71428583 160.71428584 72.32142832 160.71428584 160.71428583-72.32142832 160.71428584-160.71428584 160.71428584z m0-257.14285752c-53.03571416 0-96.42857168 43.39285752-96.42857081 96.42857168s43.39285752 96.42857168 96.42857081 96.42857168 96.42857168-43.39285752 96.42857168-96.42857168-43.39285752-96.42857168-96.42857168-96.42857168zM222.71428584 688.78571416C134.32142832 688.78571416 62 616.46428584 62 528.07142832s72.32142832-160.71428584 160.71428584-160.71428584 160.71428584 72.32142832 160.71428583 160.71428584-72.32142832 160.71428584-160.71428583 160.71428584z m0-257.14285664c-53.03571416 0-96.42857168 43.39285752-96.42857168 96.4285708s43.39285752 96.42857168 96.42857168 96.42857168 96.42857168-43.39285752 96.42857168-96.42857168-43.39285752-96.42857168-96.42857168-96.4285708z"
      fill="#0f9d58" p-id="867"></path>
  </svg>
);
const DragIcon = props => <Icon component={DragSvg} {...props}/>;
const treeData = [
  {
    key: 'js',
    title: 'js',
    isLeaf: false,
    icon: <FolderFilled/>,
    children: [
      {
        key: 'js/js知识',
        title: 'js知识',
        isLeaf: true,
        icon: <DragIcon style={{ fontSize: '18px' }}/>,
      }
    ]
  },
  {
    key: 'window',
    title: 'window',
    isLeaf: false,
    icon: <FolderFilled/>,
    children: [
      {
        key: 'window/js知识',
        title: 'js知识',
        isLeaf: true,
        icon: <DragIcon style={{ fontSize: '18px' }}/>,
      },
      {
        key: 'window/js知识1',
        title: 'js知识1',
        isLeaf: true,
        icon: <DragIcon style={{ fontSize: '18px' }}/>,
      },
      {
        key: 'window/js知识2',
        title: 'js知识2',
        isLeaf: true,
        icon: <DragIcon style={{ fontSize: '18px' }}/>,
      },
      {
        key: 'window/js知识3',
        title: 'js知识3',
        isLeaf: true,
        icon: <DragIcon style={{ fontSize: '18px' }}/>,
      },
    ]
  },
  {
    key: '工作笔记',
    title: '工作笔记',
    isLeaf: false,
    icon: <FolderFilled/>,
    children: [
      {
        key: '工作笔记/flydiy',
        title: 'flydiy',
        isLeaf: true,
        icon: <DragIcon style={{ fontSize: '18px' }}/>,
      },
      {
        key: '工作笔记/a',
        title: 'a',
        isLeaf: true,
        icon: <DragIcon style={{ fontSize: '18px' }}/>,
      },
      {
        key: '工作笔记/b',
        title: 'b',
        isLeaf: true,
        icon: <DragIcon style={{ fontSize: '18px' }}/>,
      },
      {
        key: '工作笔记/c',
        title: 'c',
        isLeaf: true,
        icon: <DragIcon style={{ fontSize: '18px' }}/>,
      },
    ]
  },
];
const data = {
  nodes: [
    {
      id: '0',
      x: 55,
      y: 55,
      tableName: 'frdp_project_info',
      tableDesc: '项目表',
      attrs: [
        { name: 'projectID', type: 'VARCHAR(64)' },
        { name: 'workspaceID' },
        { name: 'projectName' },
      ],
    },
    {
      id: '1',
      tableName: 'Node',
      x: 55,
      y: 255,
      attrs: [
        { name: 'id', type: 'string' },
        { name: 'opacity' },
        { name: 'transparent' },
      ],
    },
  ],
  edges: [
    {
      label: 'Label2',
      source: '0',
      target: '1',
    },
  ],
};

interface FileTree extends FileNode {
  icon: JSX.Element;
  children: FileTree[];
}

interface ModelEditorProps extends Store {
  fileTree: FileTree[],
}

interface ModelEditorState {
  visible: boolean;
  createModal: {
    visible: boolean;
    type: string;
    dir: string;
  };
  tree: any[];
  currentType: 'flow' | 'excel' | 'md' | 'none';
  flowOption: {
    data: any;
  };
  viewOption: {
    ext: string;
    data: any;
  }
}

export class Editor extends React.Component<ModelEditorProps, ModelEditorState> {
  static propTypes = {
    fileTree: PropTypes.any,
    dispatch: PropTypes.func.isRequired
  };
  formRef = React.createRef<FormInstance>();
  currentNode: TreeNodeModel;

  constructor(props: Readonly<ModelEditorProps>) {
    super(props);
    this.state = {
      visible: false,
      tree: [],
      createModal: {
        visible: false,
        type: '',
        dir: '',
      },
      currentType: 'none',
      flowOption: {
        data: {
          nodes: [
            {
              id: '0',
              x: 55,
              y: 55,
              tableName: 'frdp_project_info',
              tableDesc: '项目表',
              attrs: [
                { name: 'projectID', type: 'VARCHAR(64)' },
                { name: 'workspaceID' },
                { name: 'projectName' },
              ],
            },
            {
              id: '1',
              tableName: 'Node',
              x: 55,
              y: 255,
              attrs: [
                { name: 'id', type: 'string' },
                { name: 'opacity' },
                { name: 'transparent' },
              ],
            },
          ],
          edges: [
            {
              label: 'Label2',
              source: '0',
              target: '1',
            },
          ],
        }
      },
      viewOption: {
        ext: 'none',
        data: undefined,
      },
    };
    console.log(this.props);
  }

  nzDblClick($event: NzFormatEmitEvent) {
    if(!$event.node.isLeaf){
      $event.node.isExpanded = !$event.node.isExpanded;
    }else{
      this.setState({
        viewOption: {
          ext: $event.node.origin.ext,
          data: JSON.parse(fs.readFileSync($event.node.origin.path).toString() || '{"nodes": [], "edges":[]}')
        }
      })
    }
  }

  addMind() {
    let dir = '/';
    if (this.currentNode) {
      dir = this.currentNode.isLeaf ? path.dirname(this.currentNode.key) : this.currentNode.key;
    }
    this.setState({
      createModal: {
        visible: true,
        type: 'mind',
        dir: dir,
      }
    });
  }

  addFolder() {
    let dir = '/';
    if (this.currentNode) {
      dir = this.currentNode.isLeaf ? path.dirname(this.currentNode.key) : this.currentNode.key;
    }
    this.setState({
      createModal: {
        visible: true,
        type: 'folder',
        dir: dir,
      }
    });
  }

  getContextMenu(type): JSX.Element {
    return (
      <Menu style={{ minWidth: '150px' }}>
        <Menu.SubMenu title="新建">
          <Menu.Item icon={<DragIcon/>} onClick={this.addMind.bind(this, '.mindmap')}>数据库设计</Menu.Item>
          <Menu.Item icon={<FolderFilled/>} onClick={this.addFolder.bind(this)}>文件夹</Menu.Item>
        </Menu.SubMenu>
        <Menu.Item key="2" disabled={true}>上传</Menu.Item>
        <Menu.Item key="3" disabled={true}>重命名</Menu.Item>
        <Menu.Item key="4" disabled={true}>复制</Menu.Item>
        <Menu.Item key="5" disabled={true}>粘贴</Menu.Item>
      </Menu>
    );
  }

  showContextMenu($event: MouseEvent) {
    $event.preventDefault();
    this.setState({ visible: true });
  }

  selectNode($event: NzFormatEmitEvent) {
    this.currentNode = $event.node;
  }

  createModal_onOk() {
    this.formRef.current.submit();
  }

  createModal_submit(values) {
    if (this.state.createModal.type === 'folder') {
      // @ts-ignore
      this.props.dispatch(createFolder(path.join(this.state.createModal.dir, values.name)));
    } else {
      // @ts-ignore
      this.props.dispatch(createFile(path.join(this.state.createModal.dir, values.name) + '.mindmap'));
    }
    this.setState({
      createModal: { visible: false, dir: '', type: '' },
    });
  }

  createModal_onCancel() {
    this.setState({
      createModal: {
        visible: false,
        type: 'mind',
        dir: '',
      }
    });
  }

  checkFileName({ getFieldValue }) {
    return {
      validator: async (rule, value) => {
        if (!value) {
          return Promise.resolve();
        }
        if (!(await checkFileName(value))) {
          return Promise.reject('文件名有不能使用的符号!');
        }
        if (this.state.createModal.type === 'folder') {
          if (await checkFileExists(path.join(this.state.createModal.dir, value))) {
            return Promise.reject('文件名重复!');
          }
        } else {
          if (await checkFileExists(path.join(this.state.createModal.dir, value + '.mindmap'))) {
            return Promise.reject('文件名重复!');
          }
        }
        return Promise.resolve();
      },
    };
  }

  clearSelect(e: MouseEvent) {
    if (this.currentNode && (e.target as HTMLElement).classList.contains(styles.tree)) {
      this.currentNode.isSelected = false;
      this.currentNode = undefined;
    }
  }

  render() {
    return (
      <div className={styles.main}>
        <div className={styles.headBar}></div>
        <Dropdown overlay={this.getContextMenu.bind(this)} trigger={['contextMenu']}>
          <div className={styles.tree} onContextMenu={this.clearSelect.bind(this)} onClick={this.clearSelect.bind(this)}>
            <Tree data={this.props.fileTree} nzDblClick={this.nzDblClick.bind(this)}
                  nzClick={this.selectNode.bind(this)}/>
          </div>
        </Dropdown>
        <GGEditor style={{display: this.state.viewOption.ext === '.mindmap' ? 'block' : 'none'}}>
          <Flow
            className={styles.graph}
            data={data}
            graphConfig={{ defaultNode: { type: 'bizTableNode' } }}
          />
        </GGEditor>
        <Modal
          title="新建"
          visible={this.state.createModal.visible}
          onOk={this.createModal_onOk.bind(this)}
          onCancel={this.createModal_onCancel.bind(this)}
        >
          <Form ref={this.formRef} onFinish={this.createModal_submit.bind(this)}>
            <Form.Item
              label="名称"
              name="name"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: '请输入名称!',
                },
                this.checkFileName.bind(this),
              ]}
            >
              <Input name="name" prefix={this.state.createModal.type === 'folder' ? <FolderFilled/> : <DragIcon/>}/>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }
}

function mapStateToProps(state: any) {
  const fileNode: FileTree[] = [];
  Object.keys(state.file.fileMap).forEach((key) => {
    const file = state.file.fileMap[key];
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
    node.icon = node.isDirectory ? <FolderFilled/> : <DragSvg/>;
    node.isLeaf = !node.isDirectory;
  });
  return {
    fileMap: state.file.fileMap,
    fileTree: fileTree,
    fileNode: fileNode,
  };
}

export default connect(mapStateToProps)(Editor);
