import {
  EventEmitter, DefaultDOMElement, isString
} from 'substance'

import JATS from '../JATS'
import TextureArticleSchema from '../TextureArticleSchema'
import { jats2restrictedJats } from './j2r'
import { jats2internal } from './r2t'
import validateXML from './util/validateXML'

export default class JATSImporter extends EventEmitter {
  import (xml, options = {}) {
    let state = {
      dom: null,
      errors: {
        'parse': [],
        'validate-jats': [],
        'jats2restrictedJats': [],
        'validate-texture-article': [],
        'jats2internal': []
      },
      hasErrored: false
    }

    if (isString(xml)) {
      try {
        state.dom = DefaultDOMElement.parseXML(xml)
      } catch (err) {
        console.error('Could not parse XML:', err)
        this._error(state, 'parse', {
          msg: String(err)
        })
        return
      }
    } else if (xml._isDOMElement) {
      state.dom = xml
    }

    if (!this._validate(JATS, state)) return state

    // JATS -> restricted JATS (= TextureArticleSchema)
    if (!this._transform('jats2restrictedJats', state)) return state

    if (!this._validate(TextureArticleSchema, state, options)) return state

    // restrictedJATS -> InternalArticle
    if (!this._transform('jats2internal', state)) return state

    return state
  }

  _validate (schema, state, options) {
    const name = schema.getName()
    const channel = `validate-${name}`
    let res = validateXML(schema, state.dom, options)
    if (!res.ok) {
      res.errors.forEach((err) => {
        this._error(state, channel, err)
      })
      return false
    }
    return true
  }

  _transform (mode, state) {
    const api = this._createAPI(state, mode)
    let dom = state.dom
    switch (mode) {
      case 'jats2restrictedJats':
        jats2restrictedJats(dom, api)
        break
      case 'jats2internal':
        state.doc = jats2internal(dom, api)
        break
      default:
        //
    }
    return true
  }

  _createAPI (state, channel) {
    const self = this
    let api = {
      error (data) {
        self._error(state, channel, data)
      }
    }
    return api
  }

  _error (state, channel, err) {
    state.hasErrored = true
    state.errors[channel].push(err)
  }
}
