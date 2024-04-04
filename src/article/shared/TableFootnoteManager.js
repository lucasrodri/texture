import { isArray, isArrayEqual } from 'substance'
import AbstractCitationManager from './AbstractCitationManager'
import { SYMBOLS } from '../ArticleConstants'

const UNDEFINED = '?'

export default class TableFootnoteManager extends AbstractCitationManager {
  constructor (documentSession, tableFigure) {
    super(documentSession, 'table-fn', ['fn'], new SymbolSetLabelGenerator(SYMBOLS))

    this.tableFigure = tableFigure

    this._updateLabels('silent')
  }

  _getContentElement () {
    return this.tableFigure
  }

  hasCitables () {
    return (this.tableFigure.footnotes && this.tableFigure.footnotes.length > 0)
  }

  getCitables () {
    let doc = this._getDocument()
    let footnotes = this.tableFigure.footnotes
    if (footnotes) {
      // NOTE: in case of table removing there might be already no footnotes
      // in the document, so we need to filter out undefined values
      // TODO: can we solve it differently?
      return footnotes.map(id => doc.get(id)).filter(Boolean)
    } else {
      return []
    }
  }

  _detectAddRemoveCitable (op, change) {
    const contentPath = [this.tableFigure.id, 'footnotes']
    if (isArrayEqual(op.path, contentPath)) {
      const doc = this._getDocument()
      let id = op.diff.val
      let node = doc.get(id) || change.hasDeleted(id)
      return (node && this.targetTypes.has(node.type))
    } else {
      return false
    }
  }
}

class SymbolSetLabelGenerator {
  constructor (symbols) {
    this.symbols = Array.from(symbols)
  }

  getLabel (pos) {
    if (isArray(pos)) {
      pos.sort((a, b) => a - b)
      return pos.map(p => this._getSymbolForPos(p)).join(', ')
    } else {
      return this._getSymbolForPos(pos)
    }
  }

  _getSymbolForPos (pos) {
    return this.symbols[pos - 1] || UNDEFINED
  }
}
