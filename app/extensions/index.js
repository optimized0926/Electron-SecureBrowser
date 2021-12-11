const path = require('path')
const fs = require('fs-extra')

const { ExtensibleSession } = require('electron-extensions/main')

module.exports = {
  registerExtensions
}

async function registerExtensions (session) {
  const extensions = new ExtensibleSession({
    partition: 'persist:web-content',
    blacklist: ['lagatos-browser://*/*']
  })

  const rawNames = await fs.readdir(__dirname)
  const stats = await Promise.all(
    rawNames.map(
      (name) => fs.stat(
        path.join(__dirname, name)
      )
    )
  )

  const extensionFolders = rawNames.filter((name, index) => stats[index].isDirectory())

  console.log('Loading extensions', extensionFolders)

  for (const folder of extensionFolders) {
    try {
      const extension = await extensions.loadExtension(path.join(__dirname, folder))
      console.log('Loaded extension', extension.backgroundPage.webContents._events)

      if (process.env.MODE === 'debug') {
        if (extension.backgroundPage) extension.backgroundPage.webContents.openDevTools()
      }
    } catch (e) {
      console.error('Error loading extension', folder, e)
    }
  }

  return extensions
}
