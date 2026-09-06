import { app, BrowserWindow, dialog, ipcMain, session } from 'electron'
import { spawn } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import ffmpegStatic from 'ffmpeg-static-electron'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const approvedExportPaths = new Set()
const approvedProjectPaths = new Set()

ipcMain.handle('export:choose-path', async (_event, defaultName, format = 'mp4') => {
  const extension = format === 'webm' ? 'webm' : 'mp4'
  const result = await dialog.showSaveDialog({
    title: 'Export video',
    defaultPath: defaultName,
    filters: [{ name: extension === 'mp4' ? 'MP4 video' : 'WebM video', extensions: [extension] }],
  })
  if (result.canceled || !result.filePath) return null
  const filePath = result.filePath.toLowerCase().endsWith(`.${extension}`) ? result.filePath : `${result.filePath}.${extension}`
  approvedExportPaths.add(filePath)
  return filePath
})

ipcMain.handle('export:write-file', async (_event, filePath, bytes) => {
  if (!approvedExportPaths.has(filePath)) throw new Error('Export path was not approved')
  await writeFile(filePath, Buffer.from(bytes))
  return filePath
})

ipcMain.handle('export:encode-mp4', async (event, filePath, bytes, duration) => {
  if (!approvedExportPaths.has(filePath) || !filePath.toLowerCase().endsWith('.mp4')) throw new Error('MP4 export path was not approved')
  const temporaryDirectory = await mkdtemp(path.join(tmpdir(), 'lumacut-export-'))
  const inputPath = path.join(temporaryDirectory, 'render.webm')
  const ffmpegPath = app.isPackaged ? path.join(process.resourcesPath, 'ffmpeg', process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg') : ffmpegStatic.path
  await writeFile(inputPath, Buffer.from(bytes))
  try {
    await new Promise((resolve, reject) => {
      const startedAt = Date.now()
      const process = spawn(ffmpegPath, ['-y', '-i', inputPath, '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', filePath], { windowsHide: true })
      let stderr = ''
      process.stderr.on('data', (chunk) => {
        const text = String(chunk)
        stderr = `${stderr}${text}`.slice(-12000)
        const matches = [...text.matchAll(/time=(\d+):(\d+):(\d+(?:\.\d+)?)/g)]
        const match = matches.at(-1)
        if (!match) return
        const seconds = Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3])
        const ratio = Math.max(0, Math.min(.99, seconds / Math.max(.1, Number(duration) || .1)))
        const elapsed = (Date.now() - startedAt) / 1000
        event.sender.send('export:mp4-progress', { progress: ratio, etaSeconds: ratio > .01 ? Math.max(0, elapsed / ratio * (1 - ratio)) : null })
      })
      process.on('error', reject)
      process.on('close', (code) => code === 0 ? resolve() : reject(new Error(`FFmpeg exited with code ${code}: ${stderr}`)))
    })
    return filePath
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true })
  }
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
