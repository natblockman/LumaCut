import { app, BrowserWindow, dialog, ipcMain, session } from 'electron'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const approvedExportPaths = new Set()
const approvedProjectPaths = new Set()

ipcMain.handle('export:choose-path', async (_event, defaultName) => {
  const result = await dialog.showSaveDialog({
    title: 'Export video',
    defaultPath: defaultName,
    filters: [{ name: 'WebM video', extensions: ['webm'] }],
  })
  if (result.canceled || !result.filePath) return null
  const filePath = result.filePath.toLowerCase().endsWith('.webm') ? result.filePath : `${result.filePath}.webm`
  approvedExportPaths.add(filePath)
  return filePath
})

ipcMain.handle('export:write-file', async (_event, filePath, bytes) => {
  if (!approvedExportPaths.has(filePath)) throw new Error('Export path was not approved')
  await writeFile(filePath, Buffer.from(bytes))
  return filePath
})

ipcMain.handle('project:save', async (_event, defaultName, contents, existingPath) => {
  let filePath = existingPath && approvedProjectPaths.has(existingPath) ? existingPath : ''
  if (!filePath) {
    const result = await dialog.showSaveDialog({
      title: 'Save LumaCut project',
      defaultPath: defaultName,
      filters: [{ name: 'LumaCut project', extensions: ['lumacut'] }],
    })
    if (result.canceled || !result.filePath) return null
    filePath = result.filePath.toLowerCase().endsWith('.lumacut') ? result.filePath : `${result.filePath}.lumacut`
  }
  approvedProjectPaths.add(filePath)
  await writeFile(filePath, contents, 'utf8')
  return filePath
})

ipcMain.handle('project:open', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Open LumaCut project',
    properties: ['openFile'],
    filters: [{ name: 'LumaCut project', extensions: ['lumacut'] }],
  })
  if (result.canceled || !result.filePaths[0]) return null
  const filePath = result.filePaths[0]
  approvedProjectPaths.add(filePath)
  return { filePath, contents: await readFile(filePath, 'utf8') }
})

ipcMain.handle('media:file-url', (_event, filePath) => pathToFileURL(filePath).href)

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1080,
    minHeight: 720,
    backgroundColor: '#0d0e12',
    icon: path.join(root, 'dist/lumacut-icon.png'),
    title: 'LumaCut',
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(root, 'electron/preload.mjs'), contextIsolation: true },
  })
  if (process.env.VITE_DEV_SERVER_URL) win.loadURL(process.env.VITE_DEV_SERVER_URL)
  else win.loadFile(path.join(root, 'dist/index.html'))
}

app.whenReady().then(() => {
  session.defaultSession.setPermissionCheckHandler((_webContents, permission) => permission === 'media')
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => callback(permission === 'media'))
  createWindow()
  app.on('activate', () => BrowserWindow.getAllWindows().length === 0 && createWindow())
})
app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit())
