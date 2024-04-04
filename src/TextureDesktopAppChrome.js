import { DefaultDOMElement } from 'substance'
import { InMemoryDarBuffer } from './dar'
import TextureAppChrome from './TextureAppChrome'

export default class TextureDesktopAppChrome extends TextureAppChrome {
  didMount () {
    super.didMount()

    DefaultDOMElement.getBrowserWindow().on('click', this._click, this)
  }

  // emit an event on this component. The Electron binding in app.js listens to it and
  // handles it
  _handleSave () {
    this.emit('save')
  }

  // TODO: try to share implementation with TextureDesktopAppChrome
  // move as much as possible into TextureAppChrome
  // and only add browser specific overrides here
  _handleKeydown (event) {
    // let key = parseKeyEvent(event)
    // console.log('Texture received keydown for combo', key)
    let handled = false
    // CommandOrControl+S
    // if (key === 'META+83' || key === 'CTRL+83') {
    //   this._save(err => {
    //     if (err) console.error(err)
    //   })
    //   handled = true
    // }
    // if (!handled) {
    handled = this.refs.texture._handleKeydown(event)
    // }
    if (handled) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  _loadArchive (archiveId, context, cb) {
    const ArchiveClass = this._getArchiveClass()
    let storage = this.props.storage
    let buffer = new InMemoryDarBuffer()
    let archive = new ArchiveClass(storage, buffer, context)
    // HACK: this should be done earlier in the lifecycle (after first didMount)
    // and later disposed properly. However we can accept this for now as
    // the app lives as a singleton atm.
    // NOTE: _archiveChanged is implemented by DesktopAppChrome
    archive.on('archive:changed', this._archiveChanged, this)
    // ATTENTION: we want to treat new archives as 'read-only' in the
    // sense that a new archive is essentially one of several dar templates.
    archive.load(archiveId, (err, archive) => {
      if (err) return cb(err)
      if (this.props.isReadOnly) {
        archive.isReadOnly = true
      }
      cb(null, archive)
    })
  }

  _saveAs (newDarPath, cb) {
    console.info('saving as', newDarPath)
    let archive = this.state.archive
    archive.saveAs(newDarPath, err => {
      if (err) {
        console.error(err)
        return cb(err)
      }
      // HACK: this is kind of an optimization but formally it is not
      // 100% correct to continue with the same archive instance
      // Instead one would expect that cloning an archive returns
      // a new archive instance
      // Though, this would have other undesired implications
      // such as loosing the scroll position or undo history
      // Thus we move on with this solution, but we need to clear
      // the isReadOnly flag now.
      archive.isReadOnly = false
      this._updateTitle()
      cb()
    })
  }

  _archiveChanged () {
    this._updateTitle()
  }

  _updateTitle () {
    const archive = this.state.archive
    if (!archive) return
    let newTitle = archive.getTitle()
    if (archive.hasPendingChanges()) {
      newTitle += ' *'
    }
    document.title = newTitle
  }

  _afterInit () {
    // Update window title after archive loading to display title
    this._updateTitle()
  }

  _click (event) {
    const target = DefaultDOMElement.wrapNativeElement(event.target)
    let url = target.getAttribute('href')
    if (target.is('a') && url !== '#') {
      event.preventDefault()
      this.emit('openExternal', url)
    }
  }
}
