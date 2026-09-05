export {}

declare global {
  interface Window {
    lumacut?: {
      platform: string
      chooseExportPath: (defaultName: string) => Promise<string | null>
      saveExportFile: (filePath: string, bytes: Uint8Array) => Promise<string>
      getFilePath: (file: File) => string
      saveProject: (defaultName: string, contents: string, existingPath: string) => Promise<string | null>
      openProject: () => Promise<{ filePath: string; contents: string } | null>
      mediaFileUrl: (filePath: string) => Promise<string>
    }
  }
}
