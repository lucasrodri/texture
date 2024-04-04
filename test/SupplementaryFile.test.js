import { DefaultDOMElement, platform } from 'substance'
import { test } from 'substance-test'
import {
  setCursor, openManuscriptEditor, PseudoDropEvent, PseudoFileEvent,
  fixture, loadBodyFixture, getDocument, openContextMenuAndFindTool,
  openMenuAndFindTool, deleteSelection, clickUndo, isToolEnabled, selectNode, insertText
} from './shared/integrationTestHelpers'
import { doesNotThrowInNodejs, exportNode, importElement } from './shared/testHelpers'
import setupTestApp from './shared/setupTestApp'

const insertFileRefToolSelector = '.sm-insert-xref-file'
const insertSupplementaryFileToolSelector = '.sm-insert-file'
const downloadSupplementaryFileToolSelector = '.sc-download-supplementary-file-tool'
const replaceSupplementaryFileToolSelector = '.sc-replace-supplementary-file-tool'

const LOCAL_ASSET_NAME = 'example.zip'
const LOCAL_ASSET_URL = './tests/fixture/assets/' + LOCAL_ASSET_NAME
const REMOTE_ASSET_URL = 'http://substance.io/images/texture-1.0.png'

test('SupplementaryFile: upload file and insert into manuscript', t => {
  let { app } = setupTestApp(t, { archiveId: 'blank' })
  let editor = openManuscriptEditor(app)

  loadBodyFixture(editor, '<p id="p1">ABC</p>')
  t.notOk(_canInsertSupplementaryFile(editor), 'tool shoud be disabled by default')
  setCursor(editor, 'p1.content', 2)
  t.ok(_canInsertSupplementaryFile(editor), 'tool shoud be enabled')
  // Note: testing this only in nodejs because in Browser it is annoying as it opens the file dialog
  const workflow = _openWorkflow(editor)
  if (platform.inNodeJS) {
    t.doesNotThrow(() => {
      workflow.find('.sc-file-upload input').click()
    }, 'using tool should not throw')
  }
  doesNotThrowInNodejs(t, () => {
    workflow.find('.sc-file-upload')._selectFile(new PseudoFileEvent())
  }, 'triggering file upload should not throw')
  let afterP = editor.find('*[data-id=p1] + *')
  t.ok(afterP.hasClass('sm-supplementary-file'), 'element after p-1 should be a supplementary file now')
  t.end()
})

test('SupplementaryFile: upload file via drop', t => {
  let { app } = setupTestApp(t, { archiveId: 'blank' })
  let editor = openManuscriptEditor(app)

  loadBodyFixture(editor, '<p id="p1">ABC</p>')
  t.notOk(_canInsertSupplementaryFile(editor), 'tool should not be enabled by default')
  setCursor(editor, 'p1.content', 2)
  t.ok(_canInsertSupplementaryFile(editor), 'tool shoud be enabled')
  const workflow = _openWorkflow(editor)
  doesNotThrowInNodejs(t, () => {
    workflow.find('.sc-file-upload')._handleDrop(new PseudoDropEvent())
  }, 'triggering file upload should not throw')
  let afterP = editor.find('*[data-id=p1] + *')
  t.ok(afterP.hasClass('sm-supplementary-file'), 'element after p-1 should be a supplementary file now')
  t.end()
})

test('SupplementaryFile: insert remote file into manuscript', t => {
  let { app } = setupTestApp(t, { archiveId: 'blank' })
  let editor = openManuscriptEditor(app)
  let doc = getDocument(editor)
  const link = 'http://substance.io/images/texture-1.0.png'

  loadBodyFixture(editor, '<p id="p1">ABC</p>')
  t.notOk(_canInsertSupplementaryFile(editor), 'tool should not be enabled by default')
  setCursor(editor, 'p1.content', 2)
  t.ok(_canInsertSupplementaryFile(editor), 'tool should be enabled')
  // Note: testing this only in nodejs because in Browser it is annoying as it opens the file dialog
  const workflow = _openWorkflow(editor)
  const urlInput = workflow.find('.sc-input-with-button > .sc-input')
  urlInput.val(link)
  const urlAddButton = workflow.find('.sc-input-with-button > .sc-button')
  urlAddButton.click()
  let afterP = editor.find('*[data-id=p1] + *')
  t.ok(afterP.hasClass('sm-supplementary-file'), 'element after p-1 should be a supplementary file now')
  let fileId = afterP.getAttribute('data-id')
  let file = doc.get(fileId)
  t.equal(file.href, link, 'link should be ' + link)
  t.ok(file.remote, 'file should be remote')
  let urlEl = afterP.find('.se-href')
  t.equal(urlEl.textContent, link, 'there should be a link to an external file inside')
  t.end()
})

const PARAGRAPH_AND_LOCAL_SUPPLEMENTARY_FILE = `
  <p id="p1">ABC</p>
  <supplementary-material id="sm1" xlink:href="${LOCAL_ASSET_NAME}" xmlns:xlink="http://www.w3.org/1999/xlink">
    <label>Supplementary File 1</label>
    <caption id="sm1-caption">
      <p id="sm1-caption-p1">Description of Supplementary File</p>
    </caption>
  </supplementary-material>
`

test('SupplementaryFile: remove from manuscript', t => {
  let { app } = setupTestApp(t, { archiveId: 'blank' })
  let editor = openManuscriptEditor(app)
  let doc = getDocument(editor)
  loadBodyFixture(editor, PARAGRAPH_AND_LOCAL_SUPPLEMENTARY_FILE)

  const _isSupplementaryFileDisplayed = () => Boolean(editor.find('.sm-supplementary-file[data-id=sm1]'))
  const _supplemenaryFileExists = () => Boolean(doc.get('sm1'))

  t.comment('initial situation')
  t.ok(_supplemenaryFileExists(), 'supplementary file node should exist in the document')
  t.ok(_isSupplementaryFileDisplayed(), 'supplementary file should be displayed')

  t.comment('deleting the supplementary file')
  selectNode(editor, 'sm1')
  deleteSelection(editor)
  t.notOk(_supplemenaryFileExists(), 'supplementary file should have been removed from document')
  t.notOk(_isSupplementaryFileDisplayed(), 'supplementary file should not be displayed anymore')

  t.comment('undoing the previous delete')
  doesNotThrowInNodejs(t, () => {
    clickUndo(editor)
  }, 'using "Undo" should not throw')
  t.ok(_supplemenaryFileExists(), 'supplementary file should be back in the document')
  t.ok(_isSupplementaryFileDisplayed(), 'supplementary file should be displayed again')
  t.end()
})

test('SupplementaryFile: reference a file from manuscript', t => {
  let { app } = setupTestApp(t, { archiveId: 'blank' })
  let editor = openManuscriptEditor(app)
  const supplementaryFileSelector = '.sc-isolated-node.sm-supplementary-file'
  const xrefSelector = '.sc-inline-node .sm-file'
  const emptyLabel = '???'
  const getXref = () => editor.find(xrefSelector)

  loadBodyFixture(editor, PARAGRAPH_AND_LOCAL_SUPPLEMENTARY_FILE)
  t.equal(editor.findAll(supplementaryFileSelector).length, 1, 'there should be only one supplementary file in document')
  t.isNil(getXref(), 'there should be no references in manuscript')

  setCursor(editor, 'p1.content', 2)
  let insertFileRef = openMenuAndFindTool(editor, 'insert', insertFileRefToolSelector)
  doesNotThrowInNodejs(t, () => {
    insertFileRef.click()
  }, 'ref insertion should not throw')

  t.isNotNil(getXref(), 'there should be reference in manuscript')
  t.equal(getXref().text(), emptyLabel, 'xref label should not contain reference')

  getXref().click()
  const firstXref = editor.find('.sc-edit-xref-tool .se-option .sc-preview')
  firstXref.click()
  t.equal(getXref().text(), 'Supplementary File 1', 'xref label should be equal to supplementary file label')

  // insert another supplement before
  setCursor(editor, 'p1.content', 1)
  const workflow = _openWorkflow(editor)
  if (platform.inNodeJS) {
    t.doesNotThrow(() => {
      workflow.find('.sc-file-upload input').click()
    }, 'using tool should not throw')
  }
  doesNotThrowInNodejs(t, () => {
    workflow.find('.sc-file-upload')._selectFile(new PseudoFileEvent())
  }, 'triggering file upload should not throw')
  t.equal(getXref().text(), 'Supplementary File 2', 'xref label should be equal to second supplementary file label')
  // remove the referenced supplement
  selectNode(editor, 'sm1')
  deleteSelection(editor)
  t.equal(getXref().text(), emptyLabel, 'xref should be broken and contain empty label')
  t.end()
})

test('SupplementaryFile: replace a file', t => {
  let { app } = setupTestApp(t, { archiveId: 'blank' })
  let editor = openManuscriptEditor(app)
  loadBodyFixture(editor, PARAGRAPH_AND_LOCAL_SUPPLEMENTARY_FILE)

  selectNode(editor, 'sm1')
  t.ok(_canReplace(editor), 'replace should be possible')
  doesNotThrowInNodejs(t, () => {
    _replaceFile(editor)
  }, 'replace file should not throw')
  t.end()
})

const FIGURE_WITH_FILE = `
  <fig id="fig1a">
    <label>Figure 1A</label>
    <caption id="fig1a-caption">
      <title>First panel</title>
      <p specific-use="display-element-wrapper">
        <supplementary-material id="sm1" mimetype="application" mime-subtype="zip" xlink:href="example.zip" xmlns:xlink="http://www.w3.org/1999/xlink">
          <caption>
            <p id="sm1-caption-p1">Description of Supplementary File</p>
          </caption>
        </supplementary-material>
      </p>
    </caption>
    <graphic />
  </fig>
`

test('SupplementaryFile: export from figure caption', t => {
  let el = DefaultDOMElement.parseSnippet(FIGURE_WITH_FILE.trim(), 'xml')
  let figureNode = importElement(el)
  let figureEl = exportNode(figureNode)
  let supFile = figureEl.find('supplementary-material')
  t.isNotNil(supFile, 'supplementary-material should be exported')
  t.end()
})

function testDownloadTool (mode, bodyXML, expectedDownloadUrl) {
  test(`SupplementaryFile: download a ${mode} file`, t => {
    let { app } = setupTestApp(t, fixture('assets'))
    let editor = openManuscriptEditor(app)
    loadBodyFixture(editor, bodyXML)

    selectNode(editor, 'sm1')
    t.ok(isToolEnabled(editor, 'context-tools', downloadSupplementaryFileToolSelector), 'download supplementary file tool shoold be available')

    let downloadTool = _getDownloadSupplementaryFileTool(editor)
    let downloadLink = downloadTool.refs.link
    // ATTENTION: in the browser we intercept the click on the link because
    // it is annoying if during tests files are actually downloaded
    if (platform.inBrowser) {
      downloadLink.el.click = () => {}
    }
    doesNotThrowInNodejs(t, () => {
      downloadTool.click()
    }, 'clicking on the download supplementary file button should not throw error')

    t.equal(downloadLink.attr('href'), expectedDownloadUrl, 'the correct download url should have been used')

    t.end()
  })
}
testDownloadTool('local', PARAGRAPH_AND_LOCAL_SUPPLEMENTARY_FILE, LOCAL_ASSET_URL)

const PARAGRAPH_AND_REMOTE_SUPPLEMENTARY_FILE = `
  <p id="p1">ABC</p>
  <supplementary-material id="sm1" xlink:href="${REMOTE_ASSET_URL}" xmlns:xlink="http://www.w3.org/1999/xlink">
    <label>Supplementary File 1</label>
    <caption id="sm1-caption">
      <p id="sm1-caption-p1">Description of Supplementary File</p>
    </caption>
  </supplementary-material>
`
testDownloadTool('remote', PARAGRAPH_AND_REMOTE_SUPPLEMENTARY_FILE, REMOTE_ASSET_URL)

test('SupplementaryFile: editing file description', t => {
  let { app } = setupTestApp(t, { archiveId: 'blank' })
  let editor = openManuscriptEditor(app)
  let doc = getDocument(editor)
  loadBodyFixture(editor, PARAGRAPH_AND_LOCAL_SUPPLEMENTARY_FILE)
  setCursor(editor, 'sm1-caption-p1.content', 0)
  insertText(editor, 'xxx')
  t.ok(doc.get(['sm1-caption-p1', 'content']).startsWith('xxx'), 'file description should have been updated')
  t.end()
})

// this test is run only in nodejs because clicking on the download tool
// in the browser actually downloads the link
if (platform.inNodeJS) {
  test('SupplementaryFile: downloading an uploaded file', t => {
    let { app } = setupTestApp(t, { archiveId: 'blank' })
    let editor = openManuscriptEditor(app)
    loadBodyFixture(editor, '<p id="p1"></p>')
    setCursor(editor, 'p1.content', 0)
    const workflow = _openWorkflow(editor)
    workflow.find('.sc-file-upload')._selectFile(new PseudoFileEvent())
    let downloadTool = _getDownloadSupplementaryFileTool(editor)
    // a freshly uploaded file is downloaded using a blob url
    t.doesNotThrow(() => {
      downloadTool.click()
    })
    t.equal(downloadTool.refs.link.el.attr('href'), `PSEUDO-BLOB-URL:test.png`)
    t.end()
  })
}

function _getInsertSupplementaryFileTool (editor) {
  return openMenuAndFindTool(editor, 'insert', insertSupplementaryFileToolSelector)
}

function _getDownloadSupplementaryFileTool (editor) {
  return openContextMenuAndFindTool(editor, downloadSupplementaryFileToolSelector)
}

function _getReplaceSupplementaryFileTool (editor) {
  return openContextMenuAndFindTool(editor, replaceSupplementaryFileToolSelector)
}

function _canInsertSupplementaryFile (editor) {
  return isToolEnabled(editor, 'insert', '.sm-insert-file')
}

function _openWorkflow (editor) {
  // open the add drop down and find tool
  const tool = _getInsertSupplementaryFileTool(editor)
  tool.click()
  let workflow = editor.find('.se-workflow-modal')
  return workflow
}

function _canReplace (editor) {
  return isToolEnabled(editor, 'context-tools', replaceSupplementaryFileToolSelector)
}

function _replaceFile (editor) {
  _getReplaceSupplementaryFileTool(editor).click()
  _getReplaceSupplementaryFileTool(editor).onFileSelect(new PseudoFileEvent())
}
