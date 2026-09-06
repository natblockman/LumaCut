export {}

declare global {
  interface Window {
    lumacut?: {
      platform: string
      chooseExportPath: (defaultName: string, format: 'mp4' | 'webm') => Promise<string | null>
      saveExportFile: (filePath: string, bytes: Uint8Array) => Promise<string>
      saveExportMp4: (filePath: string, bytes: Uint8Array, duration: number) => Promise<string>
      onMp4ExportProgress: (callback: (progress: { progress: number; etaSeconds: number | null }) => void) => () => void
      getFilePath: (file: File) => string
      saveProject: (defaultName: string, contents: string, existingPath: string) => Promise<string | null>
      openProject: () => Promise<{ filePath: string; contents: string } | null>
      mediaFileUrl: (filePath: string) => Promise<string>
    }
  }
}
