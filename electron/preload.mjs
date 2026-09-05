import { contextBridge } from 'electron'
contextBridge.exposeInMainWorld('lumacut', { platform: process.platform })
