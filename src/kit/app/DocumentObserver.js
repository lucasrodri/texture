import { NodeIndex, getKeyForPath } from 'substance'

// kind of an index that is used to dispatch updates
export default class DocumentObserver {
  constructor (doc) {
    this.doc = doc
    this.dirty = new Set()

    this.init()
  }

  init () {
    const doc = this.doc
    this.dirty.clear()
    if (!doc.getIndex('relationships')) {
      doc.addIndex('relationships', new RelationshipIndex())
    }
    doc.on('document:changed', this._onDocumentChanged, this)
  }

  dispose () {
    this.doc.off(this)
  }

  // called by EditorState when updates have been propagated
  reset () {
    this.dirty = new Set()
  }

  setDirty (path) {
    this.dirty.add(getKeyForPath(path))
  }

  // TODO: this is built on top of the current implementation of
  // DocumentChange. We could try to consolidate and have just
  // one place where this information is derived
  _onDocumentChanged (change) {
    let dirty = this.dirty
    Object.keys(change.updated).forEach(id => {
      dirty.add(id)
    })
  }
}

const ONE = Symbol('ONE')
const MANY = Symbol('MANY')

class RelationshipIndex extends NodeIndex {
  constructor () {
    super()
    // a mapping from type to relational properties
    this._relationsByType = {}
    // the inverse index
    this._byTarget = new ValuesById()
  }

  get (targetId) {
    return this._byTarget.get(targetId)
  }

  select (node) { // eslint-disable-line no-unused-vars
    return true
  }

  clear () {
    this._byTarget.clear()
  }

  create (node) { // eslint-disable-line no-unused-vars
    let relations = this._getRelations(node)
    if (!relations) return
    for (let [name, type] of relations) {
      const val = node[name]
      if (!val) continue
      if (type === ONE) {
        this._add(val, node.id)
      } else {
        val.forEach(targetId => this._add(targetId, node.id))
      }
    }
  }

  delete (node) {
    let relations = this._getRelations(node)
    if (!relations) return
    for (let [name, type] of relations) {
      const val = node[name]
      if (!val) continue
      if (type === ONE) {
        this._remove(val, node.id)
      } else {
        val.forEach(targetId => this._remove(targetId, node.id))
      }
    }
  }

  update (node, path, newValue, oldValue) {
    let relations = this._getRelations(node)
    if (!relations) return
    let type = relations.get(path[1])
    if (!type) return
    if (type === ONE) {
      this._remove(oldValue, node.id)
      this._add(newValue, node.id)
    } else {
      oldValue.forEach(targetId => this._remove(targetId, node.id))
      newValue.forEach(targetId => this._add(targetId, node.id))
    }
  }

  _getRelations (node) {
    let relations = this._relationsByType[node.type]
    if (relations === undefined) {
      relations = getRelations(node)
      if (relations.size === 0) relations = false
      this._relationsByType[node.type] = relations
    }
    return relations
  }

  _add (targetId, sourceId) {
    this._byTarget.add(targetId, sourceId)
  }

  _remove (targetId, sourceId) {
    this._byTarget.remove(targetId, sourceId)
  }
}

function getRelations (node) {
  let relations = new Map()
  let nodeSchema = node.getSchema()
  for (let property of nodeSchema) {
    if (property.isReference()) {
      const name = property.name
      const type = property.isArray() ? MANY : ONE
      relations.set(name, type)
    }
  }
  return relations
}

class ValuesById {
  constructor () {
    this._index = new Map()
  }
  get (key) {
    return this._index.get(key)
  }
  add (key, val) {
    let vals = this._index.get(key)
    if (!vals) {
      vals = new Set()
      this._index.set(key, vals)
    }
    vals.add(val)
  }
  remove (key, val) {
    let vals = this._index.get(key)
    if (vals) {
      vals.delete(val)
      if (vals.size === 0) {
        this._index.delete(key)
      }
    }
  }
  clear () {
    this._index = new Map()
  }
}
