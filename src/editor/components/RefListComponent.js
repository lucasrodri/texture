import { NodeComponent } from 'substance'
import EditRelationship from '../../entities/EditRelationship'
import ModalDialog from '../../shared/ModalDialog'
import RefComponent from './RefComponent'

export default class RefListComponent extends NodeComponent {

  didMount() {
    super.didMount()

    this.handleActions({
      'done': this._doneEditing,
      'cancel': this._doneEditing,
      'closeModal': this._doneEditing,
      'entitiesSelected': this._updateReferences
    })
  }

  getInitialState() {
    return {
      edit: false
    }
  }

  render($$) {
    const referenceManager = this.context.editorSession.getManager('references')

    let el = $$('div').addClass('sc-ref-list')
    let entityIds = referenceManager.getReferenceIds()
    let bibliography = referenceManager.getBibliography()

    if (this.state.edit) {
      var modal = $$(ModalDialog, {
        width: 'medium',
        textAlign: 'center'
      })
      modal.append(
        $$(EditRelationship, {
          propertyName: 'references',
          entityIds,
          targetTypes: ['journal-article', 'book']
        })
      )
      el.append(modal)
    }

    el.append(
      $$('div').addClass('se-title').append(
        'References'
      )
    )

    bibliography.forEach((reference) => {
      el.append($$(RefComponent, { node: reference }))
    })

    el.append(
      $$('button').addClass('sc-button sm-style-big').append('Edit References').on('click', this._editBibliography)
    )
    return el
  }

  _editBibliography() {
    this.setState({
      edit: true
    })
  }

  _doneEditing() {
    this.setState({
      edit: false
    })
  }

  _updateReferences(entityIds) {
    this.context.editorSession.getManager('references').updateReferences(entityIds)
    this.setState({
      edit: false
    })
  }
}
