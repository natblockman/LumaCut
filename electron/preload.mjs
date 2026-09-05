import { contextBridge, ipcRenderer, webUtils } from 'electron'
contextBridge.exposeInMainWorld('lumacut', {
  platform: process.platform,
  chooseExportPath: (defaultName) => ipcRenderer.invoke('export:choose-path', defaultName),
  saveExportFile: (filePath, bytes) => ipcRenderer.invoke('export:write-file', filePath, bytes),
  getFilePath: (file) => webUtils.getPathForFile(file),
  saveProject: (defaultName, contents, existingPath) => ipcRenderer.invoke('project:save', defaultName, contents, existingPath),
  openProject: () => ipcRenderer.invoke('project:open'),
  mediaFileUrl: (filePath) => ipcRenderer.invoke('media:file-url', filePath),
})
