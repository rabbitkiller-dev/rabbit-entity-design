import React from 'react';
import { Collapse } from 'antd';
import { constants } from 'gg-editor';

import { FileNode } from '../../interface';

import table_drag_icon from 'assets/table_drag_icon.png';
import styles from './index.less';
import { EVENT_ENUM, eventService } from '../services';

const GraphMode = constants.GraphMode;

interface FileTree extends FileNode {
  icon: JSX.Element;
  children: FileTree[];
}

interface ModelEditorProps {
}

export default function DragPanel(props: ModelEditorProps) {
  function handleMouseDown(model: any) {
      eventService.emit(EVENT_ENUM.EntityUMLEditor_ItemDrag, model)
  };
  return (
<div>
  <Collapse defaultActiveKey={['1', '2']}>
    <Collapse.Panel showArrow={false} header="类图" key="1">
      <div className={styles.nodeElement} onMouseDown={() => {
        handleMouseDown({
          type: 'bizTableNode',
          size: [120, 140],
          center: 'topLeft',
          tableName: 'Node',
          attrs: [
            { name: 'id', type: 'Varchar(64)' },
            { name: 'opacity', type: 'Int' },
            { name: 'transparent', type: 'Boolean' },
          ],
        })
      }}>
        <img
          src={table_drag_icon}
          width="100%"
          height="100%"
          draggable={false}
        />
      </div>
    </Collapse.Panel>
    <Collapse.Panel showArrow={false} header="其它" key="2">
    </Collapse.Panel>
  </Collapse>
</div>
  );
}

