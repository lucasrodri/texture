import { AbstractGlobalEventHandler } from 'substance'

export default class GlobalEventHandler extends AbstractGlobalEventHandler {
  constructor (editorState) {
    super()

    this.editorState = editorState
  }

  getSelection () {
    return this.editorState.selection
  }
}
