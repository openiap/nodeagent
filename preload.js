const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke('ping'),
  ping: () => ipcRenderer.invoke('ping'),
  // we can also expose variables, not just functions
})

contextBridge.exposeInMainWorld('app', {
  openPackage: (id, streamid) => ipcRenderer.invoke('open-package', id, streamid),
  clearCache: () => ipcRenderer.invoke('clear-cache'),
})

