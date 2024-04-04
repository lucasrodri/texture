import { NodeComponent, createValueModel } from '../../kit'
import { PREVIEW_MODE, METADATA_MODE } from '../ArticleConstants'
import FigurePanelComponentWithMetadata from './FigurePanelComponentWithMetadata'
import FigureMetadataComponent from './FigureMetadataComponent'
import PreviewComponent from './PreviewComponent'
import LabelComponent from './LabelComponent'
import { getLabel } from './nodeHelpers'

export default class FigurePanelComponent extends NodeComponent {
  render ($$) {
    const mode = this._getMode()
    // different rendering when rendered as preview or in metadata view
    if (mode === PREVIEW_MODE) {
      return this._renderPreviewVersion($$)
    } else if (mode === METADATA_MODE) {
      return this._renderMetadataVersion($$)
    } else {
      return this._renderManuscriptVersion($$)
    }
  }

  _getClassNames () {
    return `sc-figure-panel`
  }

  _renderManuscriptVersion ($$) {
    const mode = this._getMode()
    const node = this.props.node
    const SectionLabel = this.getComponent('section-label')

    let el = $$('div')
      .addClass(this._getClassNames())
      .attr('data-id', node.id)
      .addClass(`sm-${mode}`)

    el.append(
      $$(SectionLabel, { label: 'label-label' }),
      $$(LabelComponent, { node }),
      // no label for the graphic
      this._renderContent($$),
      $$(SectionLabel, { label: 'title-label' }),
      this._renderValue($$, 'title', { placeholder: this.getLabel('title-placeholder') }).addClass('se-title'),
      $$(SectionLabel, { label: 'legend-label' }),
      this._renderValue($$, 'legend', { placeholder: this.getLabel('legend-placeholder') }).addClass('se-legend')
    )

    // TODO: this is problematic as this node does not necessarily rerender if node.metadata has changed
    // the right way is to use a ModelComponent or use an incremental updater
    // rerender the whole component on metadata changes is not good, as it leads to double rerender, because FigureMetadataComponent reacts too
    if (node.metadata.length > 0) {
      el.append(
        $$(SectionLabel, { label: 'metadata-label' }),
        $$(FigureMetadataComponent, { model: createValueModel(this.context.api, [node.id, 'metadata']) })
      )
    }

    return el
  }

  _renderContent ($$) {
    return this._renderValue($$, 'content').addClass('se-content')
  }

  _renderPreviewVersion ($$) {
    const node = this.props.node
    // TODO: We could return the PreviewComponent directly.
    // However this yields an error we need to investigate.
    let thumbnail
    let content = node.getContent()
    if (content.type === 'graphic') {
      let ContentComponent = this.getComponent(content.type)
      thumbnail = $$(ContentComponent, {
        node: content
      })
    }
    // TODO: PreviewComponent should work with a model
    // FIXME: there is problem with redirected components
    // and Component as props
    return $$('div').append($$(PreviewComponent, {
      id: node.id,
      thumbnail,
      label: getLabel(node)
    })).addClass('sc-figure-panel').attr('data-id', node.id)
  }

  _renderMetadataVersion ($$) {
    return $$(FigurePanelComponentWithMetadata, { node: this.props.node })
  }

  _getMode () {
    return this.props.mode || 'manuscript'
  }
}
