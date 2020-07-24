import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
const fs = require('electron').remote.require('fs');
import path from 'path';
// eslint-disable-next-line import/no-cycle
import { AppThunk, RootState } from '../store';
import { filepathIntoKey, getAppPath, getDefaultFiles, getDefaultFileTree } from './project';
import { FileNode as _FileNode } from '../interface';
import { forEachTree } from '../utils/tree';
import { FileNameCompare } from '../utils/file-name-compare';

const initialState: {
  fileTree: _FileNode[]
} = { fileTree: [] };

export const reloadFile = createAsyncThunk(
  'file/reloadFileStatus',
  async () => {
    const defaultPath = path.join(await getAppPath(), 'default');
    const fileTree = await getDefaultFileTree(defaultPath);
    return { fileTree };
  }
);

export const createFile = createAsyncThunk(
  'file/createFileStatus',
  async (filepath: string) => {
    filepath = path.join(await getAppPath(), 'default', filepath);
    fs.writeFileSync(filepath, '');
    return {
      key: await filepathIntoKey(filepath),
      path: filepath,
      title: path.basename(filepath),
      ext: path.extname(filepath),
      children: [],
      isDirectory: false,
    };
  }
);
export const createFolder = createAsyncThunk(
  'file/createFolderStatus',
  async (filepath: string) => {
    filepath = path.join(await getAppPath(), 'default', filepath);
    fs.mkdirSync(filepath);
    return {
      key: await filepathIntoKey(filepath),
      path: filepath,
      title: path.basename(filepath),
      ext: path.extname(filepath),
      children: [],
      isDirectory: true,
    };
  }
);


const fileSlice = createSlice({
  name: 'file',
  initialState: initialState,
  reducers: {
    // reloadFile: (state) => {
    //   getDefaultFiles().then((files) => {
    //     files.map((file) => {
    //       const fileStat = fs.statSync(file);
    //       const fileNode: FileNode = {
    //         key: file,
    //         title: path.basename(file),
    //         type: 'flow_database',
    //       };
    //       state.fileMap[file] = fileNode;
    //     });
    //   });
    // },
    // createFile: (state, action) => {
    //   const payload: string = action.payload;
    //   console.log(payload);
    //   getAppPath().then((appPath) => {
    //     const filepath = path.join(appPath, 'default', payload);
    //     fs.writeFileSync(filepath, '');
    //   });
    // },
  },
  extraReducers: {
    // @ts-ignore
    [reloadFile.fulfilled]: (state, action) => {
      const { fileTree } = action.payload;
      state.fileTree = fileTree;
    },
    // @ts-ignore
    [createFile.fulfilled]: (state, action) => {
      const fileNode: _FileNode = action.payload;
      const deepFileTree = JSON.parse(JSON.stringify(state.fileTree));
      if (path.dirname(fileNode.key) === '/') {
        deepFileTree.push(fileNode);
        deepFileTree.children.sort(sort);
      } else {
        forEachTree(deepFileTree, (node: _FileNode) => {
          console.log('folder:', node.key, path.dirname(fileNode.key));
          if (node.key === path.dirname(fileNode.key)) {
            node.children.push(fileNode);
            node.children.sort(sort);
          }
        });
      }
      state.fileTree = deepFileTree;
    },
    // @ts-ignore
    [createFolder.fulfilled]: (state, action) => {
      const fileNode: _FileNode = action.payload;
      const deepFileTree = JSON.parse(JSON.stringify(state.fileTree));
      if (path.dirname(fileNode.key) === '/') {
        deepFileTree.push(fileNode);
        deepFileTree.children.sort(sort);
      } else {
        forEachTree(deepFileTree, (node: _FileNode) => {
          console.log('folder:', node.key, path.dirname(fileNode.key));
          if (node.key === path.dirname(fileNode.key)) {
            node.children.push(fileNode);
            node.children.sort(sort);
          }
        });
      }
      state.fileTree = deepFileTree;
    },
  }
});

// export const { reloadFile } = fileSlice.actions;

export default fileSlice.reducer;

export const fileCount = (state: RootState) => state.file;

function sort(item1: _FileNode, item2: _FileNode): number {
  if (item1.isDirectory === item2.isDirectory) { // 如果一样就对比名称
    return FileNameCompare(item1.title, item2.title);
  }
  return item1.isDirectory ? 1 : -1;
}
