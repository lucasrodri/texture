import {
  documentHelpers, Selection, selectionHelpers
} from 'substance'

export default class SelectionStateReducer {
  constructor (appState) {
    this.appState = appState
    appState.addObserver(['document', 'selection'], this.update, this, { stage: 'update' })
  }

  update () {
    const appState = this.appState
    let doc = appState.get('document')
    let sel = appState.get('selection')
    let newState = this.deriveState(doc, sel)
    appState.set('selectionState', newState)
  }

  deriveState (doc, sel) {
    let state = this.createState(sel)
    this.deriveContext(state, doc, sel)
    this.deriveContainerSelectionState(state, doc, sel)
    this.deriveAnnoState(state, doc, sel)
    if (doc.getIndex('markers')) {
      this.deriveMarkerState(state, doc, sel)
    }
    return state
  }

  deriveContext (state, doc, sel) {
    if (!sel || sel.isNull()) return
    if (sel.isPropertySelection() || sel.isNodeSelection() || sel.isCustomSelection()) {
      let nodeId = sel.getNodeId()
      let node = doc.get(nodeId)
      if (node) {
        state.xpath = node.getXpath().toArray()
        state.node = node
      }
    }
  }

  deriveContainerSelectionState (state, doc, sel) {
    let containerPath = sel.containerPath
    if (containerPath) {
      state.containerPath = containerPath
      let nodeIds = doc.get(containerPath)
      let startId = sel.start.getNodeId()
      let endId = sel.end.getNodeId()
      let startNode = documentHelpers.getContainerRoot(doc, containerPath, startId)
      // FIXME: it happened that we have set the containerPath incorrectly
      // e.g. body.content for a selection in abstract
      if (!startNode) {
        console.error('FIXME: invalid ContainerSelection')
        return
      }
      let startPos = startNode.getPosition()
      if (startPos > 0) {
        state.previousNode = documentHelpers.getPreviousNode(doc, containerPath, startPos)
      }
      state.isFirst = selectionHelpers.isFirst(doc, containerPath, sel.start)
      let endPos
      if (endId === startId) {
        endPos = startPos
      } else {
        let endNode = documentHelpers.getContainerRoot(doc, containerPath, endId)
        endPos = endNode.getPosition()
      }
      if (endPos < nodeIds.length - 1) {
        state.nextNode = documentHelpers.getNextNode(doc, containerPath, endPos)
      }
      state.isLast = selectionHelpers.isLast(doc, containerPath, sel.end)
    }
  }

  deriveAnnoState (state, doc, sel) {
    // create a mapping by type for the currently selected annotations
    // create a mapping by type for the currently selected annotations
    let annosByType = {}
    function _add (anno) {
      if (!annosByType[anno.type]) {
        annosByType[anno.type] = []
      }
      annosByType[anno.type].push(anno)
    }
    const propAnnos = documentHelpers.getPropertyAnnotationsForSelection(doc, sel)
    propAnnos.forEach(_add)
    if (propAnnos.length === 1 && propAnnos[0].isInlineNode()) {
      state.isInlineNodeSelection = propAnnos[0].getSelection().equals(sel)
    }
    const containerPath = sel.containerPath
    if (containerPath) {
      const containerAnnos = documentHelpers.getContainerAnnotationsForSelection(doc, sel, containerPath)
      containerAnnos.forEach(_add)
    }
    state.annosByType = annosByType
  }

  deriveMarkerState (state, doc, sel) {
    let markers = documentHelpers.getMarkersForSelection(doc, sel)
    state.markers = markers
  }

  createState (sel) {
    return new SelectionState(sel)
  }
}

class SelectionState {
  constructor (sel) {
    this.selection = sel || Selection.null

    Object.assign(this, {
      // all annotations under the current selection
      annosByType: null,
      // markers under the current selection
      markers: null,
      // flags for inline nodes
      isInlineNodeSelection: false,
      // container information (only for ContainerSelection)
      containerPath: null,
      previousNode: null,
      nextNode: null,
      // if the previous node is one char away
      isFirst: false,
      // if the next node is one char away
      isLast: false,
      // current context
      xpath: []
    })
  }
}
