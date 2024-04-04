import { prettyPrintXML, DefaultDOMElement } from 'substance'
import { PersistedDocumentArchive } from './dar'
import { ArticleLoader, JATSExporter } from './article'

export default class TextureArchive extends PersistedDocumentArchive {
  /*
    Creates EditorSessions from a raw archive.
    This might involve some consolidation and ingestion.
  */
  _ingest (rawArchive) {
    let sessions = {}
    let manifestXML = _importManifest(rawArchive)
    let manifestSession = this._loadManifest({ data: manifestXML })
    sessions['manifest'] = manifestSession
    let entries = manifestSession.getDocument().getDocumentEntries()

    entries.forEach(entry => {
      let record = rawArchive.resources[entry.path]
      // Note: this happens when a resource is referenced in the manifest
      // but is not there actually
      // we skip loading here and will fix the manuscript later on
      if (!record) {
        return
      }
      // Load any document except pub-meta (which we prepared manually)
      if (entry.type !== 'pub-meta') {
        // TODO: we need better concept for handling errors
        let session
        // Passing down 'sessions' so that we can add to the pub-meta session
        session = this._loadDocument(entry.type, record, sessions)
        sessions[entry.id] = session
      }
    })
    return sessions
  }

  _repair () {
    let manifestSession = this.getDocumentSession('manifest')
    let entries = manifestSession.getDocument().getDocumentEntries()
    let missingEntries = []

    entries.forEach(entry => {
      let session = this.getDocumentSession(entry.id)
      if (!session) {
        missingEntries.push(entry.id)
        console.warn(`${entry.path} could not be found in the archive`)
      }
    })

    // TODO: rethink this. IMO it is a HACK to do such things automatically
    // Instead the user should be informed about the problem and be asked to fix it.
    if (missingEntries.length > 0) {
      // Cleanup missing entries
      // manifestSession.transaction(tx => {
      //   let documentsEl = tx.find('documents')
      //   missingEntries.forEach(missingEntry => {
      //     let entryEl = tx.get(missingEntry)
      //     documentsEl.removeChild(entryEl)
      //   })
      // })
    }
  }

  _exportManifest (sessions, buffer, rawArchive) {
    let manifest = sessions.manifest.getDocument()
    if (buffer.hasResourceChanged('manifest')) {
      let manifestDom = manifest.toXML()
      let manifestXmlStr = prettyPrintXML(manifestDom)
      rawArchive.resources['manifest.xml'] = {
        id: 'manifest',
        data: manifestXmlStr,
        encoding: 'utf8',
        updatedAt: Date.now()
      }
    }
  }

  // TODO: this should be generalized and then live in the base class
  _exportChangedDocuments (sessions, buffer, rawArchive) {
    // Note: we are only adding resources that have changed
    // and only those which are registered in the manifest
    let entries = this.getDocumentEntries()
    for (let entry of entries) {
      let { id, type, path } = entry
      const hasChanged = buffer.hasResourceChanged(id)
      // skipping unchanged resources
      if (!hasChanged) continue
      // We mark a resource dirty when it has changes, or if it is an article
      // and pub-meta has changed
      if (type === 'article') {
        let session = sessions[id]
        // TODO: how should we communicate file renamings?
        rawArchive.resources[path] = {
          id,
          // HACK: same as when loading we pass down all sessions so that we can do some hacking there
          data: this._exportDocument(type, session, sessions),
          encoding: 'utf8',
          updatedAt: Date.now()
        }
      }
    }
  }

  _loadDocument (type, record, sessions) {
    switch (type) {
      case 'article': {
        return ArticleLoader.load(record.data, {}, this._config)
      }
      default:
        throw new Error('Unsupported document type')
    }
  }

  _exportDocument (type, session, sessions) { // eslint-disable-line no-unused-vars
    switch (type) {
      case 'article': {
        let exporter = new JATSExporter()
        let doc = session.getDocument()
        let res = exporter.export(doc)
        // TODO: we need a way to report this problem, i.e. make us at least aware of it
        // if (!res.ok) {
        //   throw new Error('FIXME: generated XML is not JATS compliant!')
        // }
        let jats = res.jats
        console.info('saving jats', jats.getNativeElement())
        let xmlStr = prettyPrintXML(jats)
        return xmlStr
      }
      default:
        throw new Error('Unsupported document type')
    }
  }

  getTitle () {
    let editorSession = this.getDocumentSession('manuscript')
    let title = 'Untitled'
    if (editorSession) {
      let doc = editorSession.getDocument()
      let articleTitle = doc.getTitle()
      if (articleTitle) {
        title = articleTitle
      }
    }
    return title
  }
}

/*
  Create an explicit entry for pub-meta.json, which does not
  exist in the serialisation format
*/
function _importManifest (rawArchive) {
  let manifestXML = rawArchive.resources['manifest.xml'].data
  let dom = DefaultDOMElement.parseXML(manifestXML)
  return dom.serialize()
}
