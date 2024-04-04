import { DefaultDOMElement, isArray } from 'substance'
import { test } from 'substance-test'
import setupTestApp from './shared/setupTestApp'
import { openManuscriptEditor, getDocument, getApi, setCursor, loadBodyFixture } from './shared/integrationTestHelpers'

/*
  container -> container:
    => if not supported turn into textish and wrap into default type || alternatively just skip
    -> body: everthing allowed
    -> footnote: only 'p

  container -> text:
    => turn every node into textish, concat with ' ', then paste again

  text -> text:
    => filter all unsupported annos

  text -> container:
    => wrap into default text type with filtering allowed types
*/
const PARAGRAPH = `<p id="p1" />`
const FIGURE = `<fig id="f1"><graphic /><caption id="f1-caption"><p id="f1-caption-p1" /></caption></fig>`

const CONTAINER_SNIPPET = `
<p>PARAGRAPH</p>
<h1>HEADING</h1>
<p>PARAGRAPH</p>
`

test('Paste: pasting a container into body', t => {
  let { editor, snippet, api, doc } = _setup(t, CONTAINER_SNIPPET, PARAGRAPH)
  setCursor(editor, 'p1.content', 0)
  api.paste(snippet)
  let body = doc.get('body')
  let expected = ['paragraph', 'heading', 'paragraph']
  let actual = body.getNodes().map(el => el.type)
  t.deepEqual(actual, expected, 'content should have been pasted into body')
  t.end()
})

test('Paste: pasting a container into figure legend', t => {
  let { editor, snippet, api, doc } = _setup(t, CONTAINER_SNIPPET, FIGURE)
  setCursor(editor, 'f1-caption-p1.content', 0)
  api.paste(snippet)
  // ATTENTION: for now substance does not transform unsupported nodes (e.g. heading -> paragraph)
  // and instead drops the invalid node
  let expected = ['paragraph', 'paragraph']
  let actual = doc.resolve(['f1', 'legend']).map(el => el.type)
  t.deepEqual(actual, expected, 'only <p> elements should have been pasted')
  t.end()
})

function _setup (t, snippetHtml, fixture) {
  let { app } = setupTestApp(t, { archiveId: 'blank' })
  let editor = openManuscriptEditor(app)
  let api = getApi(editor)
  let doc = getDocument(editor)

  loadBodyFixture(editor, fixture)

  let importer = editor.context.configurator.getImporter('html')
  let snippet = doc.createSnippet()
  let container = snippet.getContainer()
  importer.setDocument(snippet)
  let els = DefaultDOMElement.parseSnippet(snippetHtml.trim(), 'html')
  if (!isArray(els)) els = [els]
  els = els.filter(el => el.isElementNode())
  els.forEach(el => {
    let node = importer.convertElement(el)
    if (node) {
      container.append(node.id)
    }
  })
  return { editor, snippet, api, doc }
}
