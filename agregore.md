# Agregore Browser 

Forked from Agregore Browser v1.0.0-13 

- Clone the repo
- `npm install`
- `bash ./rebuild.sh`
- `npm run start`

## Features / Keyboard shortcuts

- Navigate web pages (back and forward with `ctrl+[` and `ctrl+]`)
- Open multiple windows (`ctrl+n`)
- Open links in new windows (right click on element)
- Basic navigation bar (`ctrl+l` to bring into focus)
- Find text on the page (`ctrl+f` to bring into focus, `esc` to hide)
- Dev tools (`ctrl+shift+i`)
- Autocomplete URLs from history (type in the URL bar, up/down to navigate, right to autocomplete)
- Persist open windows when quitting
- Basic Chrome Extension support (hardcoded into the source for now)
- Save files from pages (any protocol, right click it)
- Set as default browser (click Set As Default in the Help menu)

## Configuring keyboard shortcuts

Agregore uses the [rc](https://www.npmjs.com/package/rc#standards) module for loading configuration.

There's a bunch of functionality in there, but the short of it is that you can use the following as a starting point for your configuration.

Save this as a file called `agregorerc` in your "home" or "user" folder. 

```json
{
  "accelerators": {
    "OpenDevTools": "CommandOrControl+Shift+I",
    "NewWindow": "CommandOrControl+N",
    "Forward": "CommandOrControl+]",
    "Back": "CommandOrControl+[",
    "FocusURLBar": "CommandOrControl+L",
    "FindInPage": "CommandOrControl+F",
    "Reload": "CommandOrControl+R",
    "HardReload": "CommandOrControl+Shift+R",
  }
}
```

The accelerators section maps names of actions to [keyboard shortcuts](https://www.electronjs.org/docs/api/accelerator).

You can set these to whatever you want and it will override the defaults listed above.

Check out `app/actions.js` for a full list of action names since some of them don't have keyboard shortcuts by default.



## Features that have shipped with this version of Agregore v1.0.0-13

- [ ] Basic browser features
	- [x] Navigate to URL
	- [x] Back / Forward
	- [x] Welcome page
- [ ] Basic hypercore-protocol / dat support
- [ ] Better navigation UX
	- [x] Multiple windows
	- [x] Shortcuts for window creation
	- [x] Only allow single instance of the app (reuse the protocol handlers across windows)
	- [x] Make sure protocol handlers open correct URL
	- [x] Make sure page titles update the window title
	- [x] Keyboard shortcuts (use Menu bar with accelerator keys)
		- [x] Dev tools
		- [x] `ctrl+[` and `ctrl+]` for navigating history
		- [x] `ctrl+l` for selecting the navigation bar
	- [x] saveAs context menu (using fetch and fs.createWriteStream())
	- [x] Persist windows on application quit
	- [x] Find in page [API](https://www.electronjs.org/docs/api/web-contents#contentsfindinpagetext-options)
	- [x] Clicking on suggested URL navigates to it
	- [x] Hitting tab when selecting a suggestion sets the URL without navigating
	- [x] Apply context menu handlers to all created windows
	- [x] Hitting escape in URL bar should clear the search options and focus the content
- [ ] fetch API for hyperdrives [GH issue](https://github.com/cliqz-oss/dat-webext/issues/159)
	- [x] Creating an archive
	- [x] PUT/DELETE methods for files / folders
- [ ] Better browser history
	- [x] As an extension?
	- [x] Save history to a DB
	- [x] Search through history?
	- [x] Provide history suggestions when typing in URL bar
- [ ] WebXR - Make sure it's working!
- [ ] Web extension support via [electron-extensions](https://github.com/sentialx/electron-extensions)
	- [x] Load extensions from `app/extensions/` folder
- [ ] PWA support
	- [x] Service Workers (Free with Electron)
