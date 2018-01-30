import { NodeComponent, isNil, without } from 'substance'
import ModalDialog from '../../shared/ModalDialog'
import CreateEntity from '../../entities/CreateEntity'
import EditEntity from '../../entities/EditEntity'
import RefComponent from './RefComponent'

function prefillEntity(type, text) {
  let defaults = {
    type
  }
  if (type === 'person') {
    let parts = text.split(' ')
    defaults.surname = parts.pop()
    defaults.givenNames = parts.join(' ')
  } else if (type === 'organisation') {
    defaults.name = text
  } else if (type === 'book') {
    defaults.source = text
  } else if (type === 'journal-article') {
    defaults.articleTitle = text
  } else if (type === 'conference-proceeding') {
    defaults.articleTitle = text
  } else if (type === 'clinical-report') {
    defaults.articleTitle = text
  } else if (type === 'preprint') {
    defaults.articleTitle = text
  } else if (type === 'report') {
    defaults.source = text
  } else if (type === 'periodical') {
    defaults.articleTitle = text
  } else if (type === 'data-publication') {
    defaults.dataTitle = text
  } else if (type === 'patent') {
    defaults.articleTitle = text
  } else if (type === 'webpage') {
    defaults.title = text
  } else if (type === 'thesis') {
    defaults.articleTitle = text
  } else if (type === 'software') {
    defaults.title = text
  }
  return defaults
}

export default class RefListComponent extends NodeComponent {

  didMount() {
    super.didMount()

    this.handleActions({
      'done': this._doneEditing,
      'cancel': this._doneEditing,
      'closeModal': this._doneEditing,
      'editReference': this._onEdit,
      'removeReference': this._onRemove
    })
  }

  getInitialState() {
    return {
      //edit: false,
      mode: undefined,
      modeProps: undefined
    }
  }

  render($$) {
    const referenceManager = this.context.referenceManager
    let el = $$('div').addClass('sc-ref-list')
    let bibliography = referenceManager.getBibliography()
    let mode = this.state.mode
    let popup = this.state.popup

    if (mode) {
      let ModeComponent
      if (mode === 'edit') {
        ModeComponent = EditEntity
      } else {
        ModeComponent = CreateEntity
      }

      el.append(
        $$(ModalDialog, {
          width: 'medium',
          textAlign: 'center',
          transparent: true
        }).append(
          $$(ModeComponent, this.state.modeProps)
        )
      )
    }

    el.append(
      $$('div').addClass('se-title').append(
        'References'
      )
    )
    bibliography.forEach((reference) => {
      el.append($$(RefComponent, { node: reference }))
    })
    if(bibliography.length === 0) {
      el.append(
        $$('div').addClass('se-empty-list').append(
          this.getLabel('no-references')
        )
      )
    }

    let options = $$('div').addClass('se-ref-list-options').append(
      $$('button').addClass('sc-button sm-style-big').append('Add Reference')
        .on('click', this._toggleNewReferencePopup)
    )

    if(popup) {
      options.append(
        this._renderNewReferencePopup($$)
      )
    }

    el.append(options)

    return el
  }

  _renderNewReferencePopup($$) {
    const targetTypes = [
      'journal-article', 'book', 'conference-proceeding',
      'clinical-trial', 'preprint', 'report',
      'periodical', 'data-publication', 'patent',
      'webpage', 'thesis', 'software'
    ]
    const labelProvider = this.context.labelProvider

    let el = $$('ul').addClass('se-new-reference-menu')
    targetTypes.forEach(item => {
      el.append(
        $$('li').addClass('se-type').append(
          labelProvider.getLabel(item)
        ).on('click', this._onCreate.bind(this, item))
      )
    })

    return el
  }

  _toggleNewReferencePopup() {
    const popup = this.state.popup
    this.extendState({
      popup: !popup
    })
  }

  _doneEditing() {
    this.extendState({
      mode: undefined
    })
  }

  _onCreate(targetType) {
    let defaults = {}
    defaults = prefillEntity(targetType, '')
    this.extendState({
      mode: 'create',
      modeProps: {
        type: targetType,
        defaults: defaults
      }
    })
  }

  _onEdit(entityId) {
    let db = this.context.pubMetaDbSession.getDocument()
    let node = db.get(entityId)
    this.extendState({
      mode: 'edit',
      modeProps: {
        node
      }
    })
  }

  _onRemove(entityId) {
    const referenceManager = this.context.referenceManager
    let bibliography = referenceManager.getBibliography()
    let entityIdsList = bibliography.map((e) => {
      if (!e.state.entity) {
        console.error('FIXME: no entity for bib item', e.id)
        return undefined
      } else {
        return e.state.entity.id
      }
    })
    let entityIds = without(entityIdsList, entityId)
    referenceManager.updateReferences(entityIds)
  }
}
