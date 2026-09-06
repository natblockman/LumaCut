import { contextBridge, ipcRenderer, webUtils } from 'electron'
contextBridge.exposeInMainWorld('lumacut', {
  platform: process.platform,
  chooseExportPath: (defaultName, format) => ipcRenderer.invoke('export:choose-path', defaultName, format),
  saveExportFile: (filePath, bytes) => ipcRenderer.invoke('export:write-file', filePath, bytes),
  saveExportMp4: (filePath, bytes, duration) => ipcRenderer.invoke('export:encode-mp4', filePath, bytes, duration),
  onMp4ExportProgress: (callback) => {
    const listener = (_event, progress) => callback(progress)
    ipcRenderer.on('export:mp4-progress', listener)
    return () => ipcRenderer.removeListener('export:mp4-progress', listener)
  },
  getFilePath: (file) => webUtils.getPathForFile(file),
  saveProject: (defaultName, contents, existingPath) => ipcRenderer.invoke('project:save', defaultName, contents, existingPath),
  openProject: () => ipcRenderer.invoke('project:open'),
  mediaFileUrl: (filePath) => ipcRenderer.invoke('media:file-url', filePath),
})
