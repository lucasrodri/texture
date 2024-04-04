import { TextNode, TEXT } from 'substance'
import { RICH_TEXT_ANNOS, EXTENDED_FORMATTING, LINKS_AND_XREFS, INLINE_NODES } from './modelConstants'

const MIN_LEVEL = 1
const MAX_LEVEL = 3

export default class Heading extends TextNode {
  get canIndent () { return true }

  indent () {
    let level = this.level
    if (level < MAX_LEVEL) {
      this.level = this.level + 1
    }
  }

  get canDedent () { return true }

  dedent () {
    let level = this.level
    if (level > MIN_LEVEL) {
      this.level = this.level - 1
    }
  }

  static get MIN_LEVEL () { return MIN_LEVEL }

  static get MAX_LEVEL () { return MAX_LEVEL }
}

Heading.schema = {
  type: 'heading',
  level: { type: 'number', default: 1 },
  content: TEXT(RICH_TEXT_ANNOS.concat(EXTENDED_FORMATTING).concat(LINKS_AND_XREFS).concat(INLINE_NODES).concat(['break']))
}
