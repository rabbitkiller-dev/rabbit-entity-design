import React, {useState} from 'react';
import styles from './EntityEditor.less';
import { Link } from 'react-router-dom';
import {
  FolderOutlined,
  SmileOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import routes from '../constants/routes.json';
import { connect } from 'react-redux';
import Icon, { FolderFilled } from '@ant-design/icons';
import { Editor } from '../containers/Editor';
import { forEachTree } from '../utils/tree';
import { FileNode } from '../interface';
import { Dropdown, Form, Input, Menu, Modal } from 'antd';
import { Tree } from './Tree';
import GGEditor, { Flow } from 'gg-editor';
import { Store } from '../store';
import { SideBarLeft } from './SideBarLeft';
import FilePanel from './FilePanel';
import DragPanel from './DragPanel';
import EntityUMLEditor from './EntityUMLEditor';
import MindmapEditor from './MindmapEditor';

interface FileTree extends FileNode {
  icon: JSX.Element;
  children: FileTree[];
}

interface ModelEditorProps {
}

export default function EntityEditor(props: ModelEditorProps) {
  const [showSideBarLeft, setShowSideBarLeft] = useState<'file_panel' | 'drag_panel'>('file_panel');
  const [showFile, setShowFile] = useState<string>(null);
  const [showFileExt, setShowFileExt] = useState<string>(null);
  function onShowFile(node: FileNode){
    console.log('onShowFile', node);
    setShowFile(node.path);
    setShowFileExt(node.ext);
  }
  return (
    <div className={styles.entity_editor}>
      <SideBarLeft showType={showSideBarLeft} onShowTypeChange={setShowSideBarLeft}/>
      <div className={styles.entity_editor_content}>
        <div className={styles.ed_head_bar}></div>
        <div className={styles.ed_left_view} style={{width: '300px'}}>
          {showSideBarLeft === 'file_panel' &&
            <FilePanel onShowFile={onShowFile}/>
          }
          {showSideBarLeft === 'drag_panel' &&
            <DragPanel />
          }
        </div>
        <div className={styles.ed_right_view} style={{width: 'calc(100% - 300px)'}}>
          {showFileExt === '.datasource' &&
            <EntityUMLEditor filePath={showFile}/>
          }
          {showFileExt === '.mindmap' &&
            <MindmapEditor filePath={showFile}/>
          }
        </div>
      </div>
    </div>
  );
}

