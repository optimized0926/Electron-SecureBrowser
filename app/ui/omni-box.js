/* global HTMLElement, CustomEvent, customElements */

class OmniBox extends HTMLElement {
  constructor () {
    super()
    this.firstLoad = true

    const { remote } = require('electron')

    this.history = remote.require('./history')
    this.lastSearch = 0
    this.lastTab = 1;
  }

  connectedCallback () {
    this.innerHTML = `
      <div class="etabs-tabgroup visible">
        <div class="etabs-tabs">
        </div>
        <div class="etabs-buttons"><button class="etabs-tab-button-new">＋</button></div>          
      </div>
      <section class="omni-box-header">
        <button class="hidden omni-box-button omni-box-back" title="Go back in history">⬅</button>
        <button class="hidden omni-box-button omni-box-forward" title="Go forward in history">➡</button>
        <form class="omni-box-form">
          <input class="omni-box-input" title="Enter search params">
          <button class="omni-box-button" type="submit" title="Load page or Reload">⊚</button>
        </form>
        <div class="extensions">
          <div class="extension adguard" data-toggle="tooltip" data-trigger="manual" data-placement="left" title="Having issues loading this page? Temporarily unblock ads and tracking for this window by clicking this shield.">
            <button><img class="inactive" src="./assets/adguard.png"></img></button>
          </div>
        </div>
      </section>
      <section class="omni-box-nav-options" aria-live="polite"></section>
    `
    this.backButton = this.$('.omni-box-back')
    this.forwardButton = this.$('.omni-box-forward')
    this.form = this.$('.omni-box-form')
    this.input = this.$('.omni-box-input')
    this.options = this.$('.omni-box-nav-options')
    this.newtabButton = this.$('.etabs-tab-button-new');
    this.adguard = this.$('.adguard button');

    window.addEventListener('load', (event) => {
      console.log('page is fully loaded');            
      const { ipcRenderer } = nodeRequire('electron');
      $('[data-toggle="tooltip"]').tooltip();
      this.initTab();
      $(".etabs-tabs").on('click', '.etabs-tab', (e) => {
        if( $(e.target).hasClass("etabs-tab-button-close")) //discard if clicks the close button
          return;
        $(".etabs-tab.active").removeClass("active");
        let target = e.currentTarget;      
        $(target).addClass("active");
        let tabId = $(target).attr("tab-id");
        ipcRenderer.send('switchtab', { tabId: tabId })        
      })
      $(".etabs-tabs").on('click', '.etabs-tab-button-close', (e) => {
        let target = e.currentTarget;      
        let tabTag = $(target).parent().parent();
        let tabId = $(tabTag).attr("tab-id");
        $(tabTag).remove();
        ipcRenderer.send('closetab', { tabId: tabId })
        var tabs = $(".etabs-tab");
        if (tabs.length != 0) {
          $(tabs[0]).addClass("active");
          tabId = $(tabs[0]).attr("tab-id");
          ipcRenderer.send('switchtab', { tabId: tabId })
        } else {
          ipcRenderer.send('switchtab', { tabId: -1 }) // emtpy
        }
      })
    });

    this.adguard.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('adguard'))
    })

    this.adguard.addEventListener('mouseover', () => {
      if($('.adguard img').hasClass("inactive") == false)
        $('.adguard').tooltip('show');
    })

    this.adguard.addEventListener('mouseout', () => {
      $('.adguard').tooltip('hide');
    })

    this.newtabButton.addEventListener('click', () => {
      this.addNewTab();
    })    

    this.input.addEventListener('focus', () => {
      this.input.select()
    })
    this.form.addEventListener('submit', (e) => {
      e.preventDefault(true)

      const url = this.getURL()

      this.clearOptions()

      this.dispatchEvent(new CustomEvent('navigate', { detail: { url } }))
    })
    this.input.addEventListener('input', () => {
      this.updateOptions()
    })
    this.input.addEventListener('keydown', ({ keyCode, key }) => {
      // Pressed down arrow
      if (keyCode === 40) this.selectNext()

      // Pressed up arrow
      if (keyCode === 38) this.selectPrevious()

      if (keyCode === 39) {
        const { selectionStart, selectionEnd, value } = this.input
        const isAtEnd = (selectionStart === value.length) && (selectionEnd === value.length)
        if (isAtEnd) this.fillWithSelected()
      }

      if (key === 'Escape') {
        this.clearOptions()
        this.dispatchEvent(new CustomEvent('unfocus'))
      }
    })

    this.backButton.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('back'))
    })
    this.forwardButton.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('forward'))
    })
  }

  initTab() {
    this.addNewTab();
  }
  
  addNewTab( url = '') {          
    const { ipcRenderer } = nodeRequire('electron');      
    ipcRenderer.send('newtab', { tabId: this.lastTab, url: url })
    $(".etabs-tab.active").removeClass("active");
    var strTab = `
        <div class="etabs-tab active visible" tab-id=${this.lastTab++}>
          <span class="etabs-tab-icon"></span>
          <span class="etabs-tab-title" title="New Tab">New Tab</span>
          <span class="etabs-tab-buttons"><button class="etabs-tab-button-close">×</button></span>
          <span class="etabs-tab-badge hidden"></span>
        </div>
      `;
    $(".etabs-tabs").append(strTab);
  }

  setActiveTabTitle (title) {
    $(".etabs-tab.active .etabs-tab-title").text(title).attr("title", title);
  }

  setAdguardState(state) {
    if (state == true)
      $(".adguard img").removeClass("inactive");
    else
      $(".adguard img").addClass("inactive");
  }
  
  clearOptions () {
    this.options.innerHTML = ''
  }

  getURL () {
    const item = this.getSelected()

    return item ? item.dataset.url : this.input.value
  }

  getSelected () {
    return this.$('[data-selected]') || this.options.firstElementChild
  }

  selectNext () {
    const item = this.getSelected()

    if (!item) return

    const sibling = item.nextElementSibling

    if (!sibling) return

    item.removeAttribute('data-selected')
    sibling.setAttribute('data-selected', 'selected')
  }

  selectPrevious () {
    const item = this.getSelected()

    if (!item) return

    const sibling = item.previousElementSibling

    if (!sibling) return

    item.removeAttribute('data-selected')
    sibling.setAttribute('data-selected', 'selected')
  }

  fillWithSelected () {
    const item = this.getSelected()

    if (!item) return

    const { url } = item.dataset

    this.input.value = url
  }

  async updateOptions () {
    const query = this.input.value

    const searchID = Date.now()
    this.lastSearch = searchID

    if (!query) {
      return
    }

    const results = await this.history.search(query)

    if (this.lastSearch !== searchID) {
      return console.debug('Urlbar changed since query finished', this.input.value, query)
    }

    const finalItems = []

    if (isURL(query)) {
      finalItems.push(this.makeNavItem(query, `Go to ${query}`))
    } else if (looksLikeDomain(query)) {
      finalItems.push(this.makeNavItem(`https://${query}`, `Go to https://${query}`))
    } else {
      finalItems.push(this.makeNavItem(
      `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
      `Search for "${query}" on DuckDuckGo`
      ))
    }

    finalItems.push(...results
      .map(({ title, url }) => this.makeNavItem(url, `${title} - ${url}`)))
    let htmlStr = '';
    for (const item of finalItems) {
      htmlStr += item.outerHTML;
    }
    this.options.innerHTML = htmlStr;
    this.getSelected().setAttribute('data-selected', 'selected')
    // add click event listener for button
    $(this.options).on('click', '.omni-box-button', (e) => {
      let url = $(e.currentTarget).attr("data-url");
      this.clearOptions()
      this.dispatchEvent(new CustomEvent('navigate', { detail: { url } }))
    })
  }

  makeNavItem (url, text) {
    const element = document.createElement('button')
    element.classList.add('omni-box-nav-item')
    element.classList.add('omni-box-button')
    element.dataset.url = url
    element.innerText = text
    element.onclick = () => {
      this.clearOptions()

      this.dispatchEvent(new CustomEvent('navigate', { detail: { url } }))
    }
    return element
  }

  static get observedAttributes () {
    return ['src', 'back', 'forward']
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if (name === 'src') {
      this.input.value = newValue
      if (this.firstLoad && (newValue === window.DEFAULT_PAGE)) {
        this.firstLoad = false
        this.focus()
      }
    } if (name === 'back') {
      this.backButton.classList.toggle('hidden', newValue === 'hidden')
    } else if (name === 'forward') {
      this.forwardButton.classList.toggle('hidden', newValue === 'hidden')
    }
  }

  get src () {
    return this.input.value
  }

  set src (value) {
    this.setAttribute('src', value)
  }

  setNavigationURL( value ) {    
    this.input.value = value;
  }

  focus () {
    this.input.focus()
    this.input.select()
  }

  $ (query) {
    return this.querySelector(query)
  }
}

function isURL (string) {
  try {
    return !!new URL(string)
  } catch {
    return false
  }
}

function looksLikeDomain (string) {
  return !string.match(/\s/) && string.includes('.')
}

customElements.define('omni-box', OmniBox)
