import React, { useState } from 'react';
import upperFirst from 'lodash/upperFirst';
import { useSelector, useDispatch } from 'react-redux';
import { FolderFilled } from '@ant-design/icons';
import { Divider, Dropdown, Menu, Tooltip } from 'antd';
import { createFromIconfontCN } from '@ant-design/icons';
import GGEditor, { Flow, ContextMenu, constants, Command } from 'gg-editor';

// const fs = require('electron').remote.require('fs');
import fs from 'fs';
import styles from '../../containers/Editor.less';
import { ModifyTable } from '../gg-editor';
import { Graph } from 'gg-editor/lib/common/interfaces';

const { EditorCommand, GraphCustomEvent } = constants;
const FLOW_COMMAND_LIST = [
  EditorCommand.Undo,
  EditorCommand.Redo,
  '|',
  EditorCommand.Copy,
  EditorCommand.Paste,
  EditorCommand.Remove,
  '|',
  EditorCommand.ZoomIn,
  EditorCommand.ZoomOut,
];
const IconFont = createFromIconfontCN({
  scriptUrl: 'https://at.alicdn.com/t/font_1518433_oa5sw7ezue.js',
});

interface EntityUMLEditorProps {
  filePath: string;
}

const data2 = {
  nodes: [
    {
      type: 'bizTableNode',
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
      type: 'bizTableNode',
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
    // { id: 'node1', x: 250, y: 200, comboId: 'combo1' },
    // { id: 'node2', x: 300, y: 200, comboId: 'combo1' },
    // { id: 'node3', x: 100, y: 200, comboId: 'combo3' }
  ],
  edges: [
    {
      label: 'Label2',
      source: '0',
      target: '1',
    },
  ],
  // combos: [
  //   { id: 'combo1', label: 'Combo 1', parentId: 'combo2' },
  //   { id: 'combo2', label: 'Combo 2' },
  //   { id: 'combo3', label: 'Combo 3', collapsed: true },
  // ],
};
let setTimeoutID;
export default function EntityUMLEditor(props: EntityUMLEditorProps) {
  if (!props.filePath) {
    return null;
  }
  const file = fs.readFileSync(props.filePath);
  let data: any = data2;
  if (file.toString()) {
    data = JSON.parse(file.toString());
  }

  function save(data: any) {
    clearTimeout(setTimeoutID);
    setTimeoutID = setTimeout(() => {
      fs.writeFileSync(props.filePath, JSON.stringify(data));
    }, 100);
  }

  return (
    <GGEditor>
      <div className={styles.toolbar}>
        {FLOW_COMMAND_LIST.map((name, index) => {
          if (name === '|') {
            return <Divider key={index} type="vertical"/>;
          }

          return (
            <Command key={name} name={name} className={styles.command} disabledClassName={styles.commandDisabled}>
              <Tooltip title={upperFirst(name)}>
                <IconFont type={`icon-${name}`}/>
              </Tooltip>
            </Command>
          );
        })}
      </div>
      <Flow
        className={styles.graph}
        data={data}
        graphConfig={{
          // renderer: 'svg',
          defaultCombo: {
            type: 'cCircle',
            labelCfg: {
              refY: 2
            }
          },
        }}
        customModes={(mode, behaviors) => {
          behaviors['drag-combo'] = 'drag-combo';
          return behaviors;
        }}
        ref={component => {
          if (component) {
            const graph: Graph = component.graph;
            graph.on(GraphCustomEvent.onAfterUpdateItem, ($event) => {
              save(graph.save());
            });
          }
        }}
      />
      <ModifyTable/>
    </GGEditor>
  );
}
