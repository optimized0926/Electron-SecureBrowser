const { pageContextMenu } = require('./context-menus')
const {
  connnectMongoDb,
  closeDB,
  insertHistory
} = require('./db');
const {
  isAuthenticated,
  verifyOtp,
  requestOtp,
  getUser,
  getUserInfo,
  getIdToken,
  getTokenSilently,
  logout
} = require('../auth')
const { accelerators } = require('../config');
const favicon = require('../favicon');
const DEFAULT_PAGE = 'lagatos://welcome'

const webview = $('#view')
const search = $('#search')
const find = $('#find')

webview.addEventListener('dom-ready', () => {
  if (process.env.MODE === 'debug') {
    webview.openDevTools()
  }
})
webview.addEventListener('switchView', (e) => {
  search.setNavigationURL(webview.view.webContents.getURL());
})
webview.addEventListener('switchAdGuard', (e) => {
  search.setAdguardState(e.detail.state);
})

search.addEventListener('adguard', (e) => {
  webview.switchAdGuard();
  webview.src = webview.view.webContents.getURL(); //reload
})
const { remote } = require('electron');
// Importing the nativeTheme module  
// using Electron remote 
const nativeTheme = remote.nativeTheme; 
const path = require("path"); 

remote.ipcMain.on('signout', (event,enable) => {
    // when user signout    
});
remote.ipcMain.on('signin', (event,enable) => {
  // when user signin    
  webview.view.webContents.send('signin')
});


function loadCSS(load) { 
  var head = document.getElementsByTagName("head")[0]; 
  var link = document.createElement("link");
  $("#theme-css").remove();
  link.id="theme-css";
  link.rel = "stylesheet"; 
  link.type = "text/css"; 
  link.href = path.join(__dirname, "/assets/" 
                        + load + ".css"); 
  head.appendChild(link);
} 
nativeTheme.on("updated", () => { 
  console.log("Updated Event has been Emitted"); 

  if (nativeTheme.shouldUseDarkColors) { 
      console.log("Dark Theme Chosen by User"); 
      console.log("Dark Theme Enabled - ",  
                  nativeTheme.shouldUseDarkColors);
      loadCSS("dark"); 
  } else { 
      console.log("Light Theme Chosen by User"); 
      console.log("Dark Theme Enabled - ",  
                  nativeTheme.shouldUseDarkColors); 

      loadCSS("light"); 
  } 
}); 
remote.ipcMain.on('changeTheme', (event, enable) => {
  if (nativeTheme.themeSource == "dark")
    nativeTheme.themeSource = "light"; 
  else
    nativeTheme.themeSource = "dark"; 
})
remote.ipcMain.on('opennewtab', (event, data) => {
  search.addNewTab(data.url);
})
remote.ipcMain.on('cleareCookies', (event, data) => {
  webview.cleareCookies();
})

const pageTitle = $('title')

const searchParams = new URL(window.location.href).searchParams

const toNavigate = searchParams.has('url') ? searchParams.get('url') : DEFAULT_PAGE

webview.src = toNavigate
connnectMongoDb();
search.addEventListener('back', () => {
  webview.goBack()
})

search.addEventListener('forward', () => {
  webview.goForward()
})

search.addEventListener('navigate', ({ detail }) => {
  const { url } = detail
  navigateTo(url)
})

search.addEventListener('unfocus', () => {
  webview.focus()
  search.src = webview.getURL()
})

webview.addEventListener('did-start-navigation', ({ detail }) => {
  const url = detail[1]
  const isMainFrame = detail[3]
  if (!isMainFrame) return
  search.src = url
})

webview.addEventListener('did-navigate', updateButtons)

//webview.view.webContents.on('context-menu', pageContextMenu.bind(webview.view))
webview.addEventListener('page-favicon-updated', async (e) => {
  var iconUrl = e.detail[1][0];
  var src = webview.src;
  await favicon.saveFavicon(src, iconUrl); // save fav icons for browser history
});

webview.addEventListener('page-title-updated', async ({ detail }) => {
  const title = detail[1]
  pageTitle.innerText = title + ' - Lagatos Browser'
  search.setActiveTabTitle(title);
  await insertHistory(webview.src, title); // add browsing history
})

webview.addEventListener('new-window', ({ detail }) => {
  const options = detail[4]

  if (options && options.webContents) {
    options.webContents.on('context-menu', pageContextMenu.bind(webview.view))
  }
})

find.addEventListener('next', ({ detail }) => {
  const { value, findNext } = detail

  webview.findInPage(value, { findNext })
})

find.addEventListener('previous', ({ detail }) => {
  const { value, findNext } = detail

  webview.findInPage(value, { forward: false, findNext })
})

find.addEventListener('hide', () => {
  webview.stopFindInPage('clearSelection')
})

function updateButtons () {
  search.setAttribute('back', webview.canGoBack() ? 'visible' : 'hidden')
  search.setAttribute('forward', webview.canGoForward() ? 'visible' : 'hidden')
}

function $ (query) {
  return document.querySelector(query)
}

function navigateTo (url) {
  if (webview.getURL() === url) {
    console.log('Reloading')
    webview.reload()
  } else {
    webview.src = url
    webview.focus()
  }
}

const { globalShortcut } = remote

globalShortcut.register(accelerators.NewWindow, () => {
  search.addNewTab();
})