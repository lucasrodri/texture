import { ScrollPane, Layout, WorkflowPane } from 'substance'
import { AbstractWriter } from '../util'
import TOCProvider from '../util/TOCProvider'
import ContextSection from './ContextSection'
import ReferenceManager from '../util/ReferenceManager'

export default class Editor extends AbstractWriter {

  _initialize(props) {
    // HACK: we assume that importer creates a journal-article entry with id 'main-article'
    // that holds the bibliography (mainarticle.references)
    super._initialize(props)
    this.referenceManager = new ReferenceManager(this.editorSession, this.context.entityDbSession, 'main-article')
  }

  getChildContext() {
    let childContext = super.getChildContext()
    return Object.assign({}, childContext, {
      referenceManager: this.referenceManager
    })
  }

  didMount() {
    super.didMount()
    this.handleActions({
      'switchContext': this._switchContext
    })
  }

  /*
    Switches the state of the context panel
  */
  _switchContext(state) {
    this.refs.contextSection.setState(state)
  }

  render($$) {
    let el = $$('div').addClass('sc-editor')
    el.append(
      this._renderMainSection($$),
      this._renderContextSection($$)
    )
    return el
  }

  _renderContextSection($$) {
    const configurator = this.getConfigurator()
    return $$(ContextSection, {
      panelsSpec: configurator.getPanelsSpec()
    }).ref('contextSection')
  }

  _renderMainSection($$) {
    const configurator = this.getConfigurator()
    let mainSection = $$('div').addClass('se-main-section')
    mainSection.append(
      this._renderToolbar($$),
      this._renderContentPanel($$),
      $$(WorkflowPane, {
        toolPanel: configurator.getToolPanel('workflow')
      })
    )
    return mainSection
  }

  _renderContentPanel($$) {
    const doc = this.editorSession.getDocument()
    const configurator = this.getConfigurator()
    const ManuscriptComponent = this.getComponent('manuscript')
    const Overlay = this.getComponent('overlay')
    // const ContextMenu = this.getComponent('context-menu')
    // const Dropzones = this.componentRegistry.get('dropzones', 'strict')

    const article = doc.get('article')

    let contentPanel = $$(ScrollPane, {
      tocProvider: this.tocProvider,
      scrollbarType: 'substance',
      scrollbarPosition: 'left',
      highlights: this.contentHighlights,
    }).ref('contentPanel')

    let layout = $$(Layout, {
      width: 'large'
    })

    layout.append(
      $$(ManuscriptComponent, {
        node: article,
        disabled: this.props.disabled
      })
    )

    contentPanel.append(
      layout,
      $$(Overlay, {
        toolPanel: configurator.getToolPanel('main-overlay'),
        theme: 'dark'
      })
      // $$(ContextMenu),
      // $$(Dropzones)
    )
    return contentPanel
  }

  _scrollTo(nodeId) {
    this.refs.contentPanel.scrollTo(`[data-id="${nodeId}"]`)
  }

  tocEntrySelected(nodeId) {
    const node = this.doc.get(nodeId)
    const editorSession = this.getEditorSession()
    const nodeComponent = this.refs.contentPanel.find(`[data-id="${nodeId}"]`)
    if (nodeComponent) {
      // TODO: it needs to be easier to retrieve the surface
      let surface = nodeComponent.context.surface
      editorSession.setSelection({
        type: 'property',
        path: node.getPath(),
        startOffset: 0,
        surfaceId: surface.id,
        containerId: surface.getContainerId()
      })
      return this._scrollTo(nodeId)
    }
  }

  getConfigurator() {
    return this.props.editorSession.configurator
  }

  /*
    Exporter provided by Texture
  */
  _getExporter() {
    return this.context.exporter
  }

  _getTOCProvider() {
    let containerId = this._getBodyContentContainerId()
    let doc = this.editorSession.getDocument()
    return new TOCProvider(doc, {
      containerId: containerId
    })
  }

  _getBodyContentContainerId() {
    const doc = this.editorSession.getDocument()
    let bodyContent = doc.article.find('body-content')
    return bodyContent.id
  }


}
