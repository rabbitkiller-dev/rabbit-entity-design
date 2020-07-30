import React, { useState } from 'react';
import upperFirst from 'lodash/upperFirst';
import { useSelector, useDispatch } from 'react-redux';
import { FolderFilled } from '@ant-design/icons';
import { Divider, Dropdown, Menu, Tooltip } from 'antd';
import { createFromIconfontCN } from '@ant-design/icons';
import GGEditor, { Flow, ContextMenu, constants, Command, Mind } from 'gg-editor';
const fs = require('electron').remote.require('fs');
import styles from '../../containers/Editor.less';
import { ModifyTable } from '../gg-editor';
const { EditorCommand } = constants;
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
  id: '0',
  label: 'Central Topic',
  children: [
    {
      id: '1',
      side: 'left',
      label: 'Main Topic 1',
    },
    {
      id: '2',
      side: 'right',
      label: 'Main Topic 2',
    },
    {
      id: '3',
      side: 'right',
      label: 'Main Topic 3',
    },
  ],
};
export default function MindmapEditor(props: EntityUMLEditorProps) {
  if (!props.filePath) {
    return null;
  }
  const file = fs.readFileSync(props.filePath);
  console.log(props.filePath, file);
  let data: any = data2;
  if (file.toString()) {
    data = JSON.parse(file.toString());
  }
  return (
    <GGEditor>
      <div className={styles.toolbar}>
        {FLOW_COMMAND_LIST.map((name, index) => {
          if (name === '|') {
            return <Divider key={index} type="vertical" />;
          }

          return (
            <Command key={name} name={name} className={styles.command} disabledClassName={styles.commandDisabled}>
              <Tooltip title={upperFirst(name)}>
                <IconFont type={`icon-${name}`} />
              </Tooltip>
            </Command>
          );
        })}
      </div>
      <Mind
        className={styles.graph}
        data={data}
        graphConfig={{
          // renderer: 'svg',
        }}
      />
      <ModifyTable />
    </GGEditor>
  );
}
