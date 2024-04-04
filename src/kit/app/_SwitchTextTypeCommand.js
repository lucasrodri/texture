import { isMatch, Command } from 'substance'

// NOTE: copied this from substance as IMO we should have basic commands within this kit
export default class SwitchTextTypeCommand extends Command {
  constructor (config) {
    super(config)
    if (!config.spec) {
      throw new Error("'config.spec' is mandatory")
    }
    if (!config.spec.type) {
      throw new Error("'config.spec.type' is mandatory")
    }
  }

  getType () {
    return this.config.spec.type
  }

  getCommandState (params) {
    const editorSession = params.editorSession
    const doc = editorSession.getDocument()
    const sel = params.selection
    const isBlurred = editorSession.isBlurred()
    let commandState = {
      disabled: false
    }
    if (sel.isPropertySelection() && !isBlurred) {
      let path = sel.getPath()
      let node = doc.get(path[0])
      if (node && node.isText()) {
        commandState.active = isMatch(node, this.config.spec)
        // When cursor is at beginning of a text block we signal
        // that we want the tool to appear contextually (e.g. in an overlay)
        commandState.showInContext = sel.start.offset === 0 && sel.end.offset === 0
      } else {
        commandState.disabled = true
      }
    } else {
      // TODO: Allow Container Selections too, to switch multiple paragraphs
      commandState.disabled = true
    }
    return commandState
  }

  /**
    Perform a switchTextType transformation based on the current selection
  */
  execute (params) {
    const editorSession = params.editorSession
    editorSession.transaction((tx) => {
      return tx.switchTextType(this.config.spec)
    })
  }

  isSwitchTypeCommand () {
    return true
  }
}
