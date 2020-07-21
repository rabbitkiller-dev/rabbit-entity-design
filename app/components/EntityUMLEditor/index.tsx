import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FolderFilled } from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';
import fs from 'fs';

interface EntityUMLEditorProps {
  filePath: string;
}

export default function EntityUMLEditor(props: EntityUMLEditorProps) {
  if (!props.filePath) {
    return null;
  }
  const file = fs.readFileSync(props.filePath);
  console.log(props.filePath, file);
  return (
    <div>EntityUMLEditor</div>
  );
}
