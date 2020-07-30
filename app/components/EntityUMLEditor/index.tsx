import React, { useEffect, useState } from 'react';
import upperFirst from 'lodash/upperFirst';
import { useSelector, useDispatch } from 'react-redux';
import { FolderFilled } from '@ant-design/icons';
import { Divider, Dropdown, Menu, Tooltip } from 'antd';
import { createFromIconfontCN } from '@ant-design/icons';
import GGEditor, { Flow, ContextMenu, constants, Command, Item, ItemPanel, global } from 'gg-editor';

// const fs = require('electron').remote.require('fs');
import fs from 'fs';
import styles from '../../containers/Editor.less';
import { ModifyTable } from '../gg-editor';
import { GGroup, Graph, GShape, NodeModel } from 'gg-editor/lib/common/interfaces';
import { eventService, EVENT_ENUM } from '../services';

const { EditorCommand, GraphCustomEvent, GraphMode } = constants;
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
  //   { id: 'combo3', label: 'Combo 3' },
  // ],
};
let setTimeoutID;
export default function EntityUMLEditor(props: EntityUMLEditorProps) {
  if (!props.filePath) {
    return null;
  }
  let graph: Graph;
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

  useEffect(() => {
    const handleMouseUp = () => {

      if (graph.getCurrentMode() === GraphMode.Default) {
        return;
      }

      const group: GGroup = graph.get('group');
      const shape: GShape = group.findByClassName(global.component.itemPanel.delegateShapeClassName) as GShape;

      if (shape) {
        shape.remove(true);
        graph.paint();
      }

      global.component.itemPanel.model = null;
      graph.setMode(GraphMode.Default);
    };

    document.addEventListener('mouseup', handleMouseUp, false);
    const itemDragDestroy = eventService.on(EVENT_ENUM.EntityUMLEditor_ItemDrag, (model: NodeModel) => {
      global.component.itemPanel.model = model;
      graph.setMode(GraphMode.AddNode);
    });

    return () => {
      itemDragDestroy();
      document.removeEventListener('mouseup', handleMouseUp, false);
    };
  });
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
      {/*      <ItemPanel className={styles.itemPanel}>
        <Item
          className={styles.item}
          model={{
            type: 'bizTableNode',
            size: [120, 140],
            tableName: 'Node',
            attrs: [
              { name: 'id', type: 'Varchar(64)' },
              { name: 'opacity', type: 'Int' },
              { name: 'transparent', type: 'Boolean' },
            ],
          }}
        >
          <img
            src={table_drag_icon}
            width="55"
            height="56"
            draggable={false}
          />
        </Item>
      </ItemPanel>*/}
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
          comboStateStyles: {
            dragenter: {
              lineWidth: 4,
              stroke: '#FE9797'
            }
          },
        }}
        customModes={(mode, behaviors) => {
          behaviors['drag-combo'] = 'drag-combo';
          return behaviors;
        }}
        ref={component => {
          if (component) {
            graph = component.graph;
            graph.on(GraphCustomEvent.onAfterUpdateItem, ($event) => {
              save(graph.save());
            });
            graph.on('combo:dragend', e => {
              graph.getCombos().forEach(combo => {
                graph.setItemState(combo, 'dragenter', false);
              });
            });
            graph.on('node:dragend', e => {
              graph.getCombos().forEach(combo => {
                graph.setItemState(combo, 'dragenter', false);
              });
            });
            graph.on('combo:dragenter', e => {
              graph.setItemState(e.item, 'dragenter', true);
            });
            graph.on('combo:dragleave', e => {
              graph.setItemState(e.item, 'dragenter', false);
            });
          }
        }}
      />
      <ModifyTable/>
    </GGEditor>
  );
}
