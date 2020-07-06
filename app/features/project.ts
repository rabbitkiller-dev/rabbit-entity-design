import os from 'os';
import fs from 'fs';
import path from 'path';

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

export async function getProject(): Promise<Array<{ projectName: string }>> {
  await initApp();
  const appPath = await getAppPath();
  const files = fs.readdirSync(appPath);
  return files.map((file) => {
    return { projectName: file };
  });
}
