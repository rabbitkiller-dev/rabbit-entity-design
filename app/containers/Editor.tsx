import React from 'react';
import GGEditor, { Flow } from 'gg-editor';
import styles from './Editor.less';
import { Tree } from '../components/Tree';
import { NzFormatEmitEvent } from '../components/Tree/interface';

const treeData = [
  {
    key: 'js',
    title: 'js',
    isLeaf: false,
    children: [
      {
        key: 'js/js知识',
        title: 'js知识',
        isLeaf: true,
      }
    ]
  },
  {
    key: 'window',
    title: 'window',
    isLeaf: false,
    children: [
      {
        key: 'window/js知识',
        title: 'js知识',
        isLeaf: true,
      },
      {
        key: 'window/js知识1',
        title: 'js知识1',
        isLeaf: true,
      },
      {
        key: 'window/js知识2',
        title: 'js知识2',
        isLeaf: true,
      },
      {
        key: 'window/js知识3',
        title: 'js知识3',
        isLeaf: true,
      },
    ]
  },
  {
    key: '工作笔记',
    title: '工作笔记',
    isLeaf: false,
    children: [
      {
        key: '工作笔记/flydiy',
        title: 'flydiy',
        isLeaf: true,
      },
      {
        key: '工作笔记/a',
        title: 'a',
        isLeaf: true,
      },
      {
        key: '工作笔记/b',
        title: 'b',
        isLeaf: true,
      },
      {
        key: '工作笔记/c',
        title: 'c',
        isLeaf: true,
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

interface ModelEditorProps {
}

interface ModelEditorState {
  tree: any[];
  currentType: 'flow' | 'excel' | 'md' | 'none';
  flowOption: {
    data: any;
  };
}

export default class ModelEditor extends React.Component<ModelEditorProps, ModelEditorState> {
  constructor(props: Readonly<ModelEditorProps>) {
    super(props);
    this.state = {
      tree: [],
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
      }
    };
  }

  nzDblClick($event: NzFormatEmitEvent) {
    $event.node.isExpanded = !$event.node.isExpanded;
  }

  render() {
    return (
      <div className={styles.main}>
        <div className={styles.tree}>
          <Tree data={treeData} nzDblClick={this.nzDblClick.bind(this)}/>
        </div>
        <GGEditor>
          <Flow
            className={styles.graph}
            data={data}
            graphConfig={{ defaultNode: { type: 'bizTableNode' } }}
          />
        </GGEditor>
      </div>
    );
  }
}
