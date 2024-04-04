import InsertCrossReferenceCommand from './InsertCrossReferenceCommand'

export default class InsertFootnoteCrossReferenceCommand extends InsertCrossReferenceCommand {
  getCommandState (params, context) {
    let sel = params.selection
    let scope = this.detectScope(params, context)
    let newState = {
      disabled: this.isDisabled(params, scope),
      showInContext: this.showInContext(sel, params, context),
      scope
    }
    return newState
  }

  detectScope (params, context) {
    // Note: ATM we only consider two scopes: 'default', 'table-figure'
    // In table-figures we will only allow to cross-reference to table-footnotes
    const xpath = params.selectionState.xpath
    return xpath.find(n => n.type === 'table-figure') ? 'table-figure' : 'default'
  }

  _getRefType (params, context) {
    let commandState = params.commandState
    if (commandState.scope === 'table-figure') {
      return 'table-fn'
    } else {
      return 'fn'
    }
  }
}
