import { ToggleTool } from '../../kit'

export default class EditExtLinkTool extends ToggleTool {
  render ($$) {
    let Input = this.getComponent('input')
    let Button = this.getComponent('button')
    let commandState = this.props.commandState
    let el = $$('div').addClass('sc-edit-external-link-tool')

    // GUARD: Return if tool is disabled
    if (commandState.disabled) {
      console.warn('Tried to render EditLinkTool while disabled.')
      return el
    }

    let urlPath = this._getUrlPath()

    el.append(
      $$(Input, {
        type: 'url',
        path: urlPath,
        placeholder: 'Paste or type a link url'
      // TODO: this component has always the same structure and should preserve all elements, event without ref
      }).ref('input'),
      $$(Button, {
        icon: 'open-link',
        theme: this.props.theme
      }).addClass('sm-open')
        .attr('title', this.getLabel('open-link'))
        .on('click', this._openLink)
    )
    return el
  }

  _getNodeId () {
    return this.props.commandState.nodeId
  }

  _getUrlPath () {
    const nodeId = this._getNodeId()
    return [nodeId, 'href']
  }

  _getDocument () {
    return this.context.editorSession.getDocument()
  }

  _openLink () {
    let doc = this._getDocument()
    let url = doc.get(this._getUrlPath())
    // FIXME: this is not the way how it should be done
    // instead we should send up an action 'open-url'
    // and let the ApplicationChrome do it.
    window.open(url, '_blank')
  }
}
