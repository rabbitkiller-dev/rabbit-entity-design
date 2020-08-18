const os = require('electron').remote.require('os');
const fs = require('electron').remote.require('fs');
import path from 'path';
import { FileNode as _FileNode, FileNode } from '../interface';
import { FileNameCompare } from '../utils/file-name-compare';

const APP_NAME = 'RabbitDesigner';

export async function getAppPath(): Promise<string> {
  return path.join(os.homedir(), APP_NAME);
}

async function initApp() {
  const appPath = await getAppPath();
  if (!fs.existsSync(appPath)) {
    fs.mkdirSync(appPath);
    fs.mkdirSync(path.join(appPath, 'default'));
  }
}

export async function getDefaultFiles(): Promise<string[]> {
  const files: string[] = [];
  const defaultPath = path.join(await getAppPath(), 'default');
  loopFile(defaultPath, (filepath) => {
    files.push(filepath.replace(defaultPath, '').replace(path.sep, '/'));
    return false;
  });
  return files;
}

export function loopFile(target: string, call: (filepath: string) => boolean) {
  const targetStat = fs.statSync(target);
  if (targetStat.isDirectory()) {
    const targetDir = fs.readdirSync(target);
    targetDir.forEach((childFileName) => {
      const childFilePath = path.join(target, childFileName);
      const childFileStat = fs.statSync(path.join(target, childFileName));
      if (childFileStat.isDirectory()) {
        loopFile(childFilePath, call);
      } else {
        call(childFilePath);
      }
    });
  } else {
    call(target);
  }
}
export async function getDefaultFileTree(target: string):　Promise<FileNode[]> {
  await initApp();
  const nodes: FileNode[] = [];
  const targetStat = fs.statSync(target);
  if (targetStat.isDirectory()) {
    const targetDir = fs.readdirSync(target);
    for(const childFileName of targetDir){
      const childFilePath = path.join(target, childFileName);
      const childFileStat = fs.statSync(path.join(target, childFileName));
      const node: FileNode = {
        key: await filepathIntoKey(childFilePath),
        path: childFilePath,
        title: path.basename(childFilePath),
        ext: path.extname(childFilePath),
        children: [],
        isDirectory: false,
      };
      if (childFileStat.isDirectory()) {
        node.isDirectory = true;
        node.children = await getDefaultFileTree(childFilePath);
      }
      nodes.push(node);
    }
  } else {
    throw new Error('地址不是目录');
  }
  nodes.sort(sort);
  return nodes;
}

export async function filepathIntoKey(filepath: string): Promise<string> {
  const defaultPath = path.join(await getAppPath(), 'default');
  return filepath.replace(defaultPath, '').replace(path.sep, '/')
}

function sort(item1: _FileNode, item2: _FileNode): number {
  if (item1.isDirectory === item2.isDirectory) { // 如果一样就对比名称
    return FileNameCompare(item1.title, item2.title);
  }
  return item1.isDirectory ? -1 : 1;
}
export async function checkFileName(filename): Promise<boolean> {
  return true;
}

export async function checkFileExists(filepath: string): Promise<boolean> {
  filepath = path.join(await getAppPath(), 'default', filepath);
  return fs.existsSync(filepath);
}
