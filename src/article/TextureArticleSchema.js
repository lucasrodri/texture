import { createSchema } from './shared/xmlSchemaHelpers'
import TextureArticleData from '../../tmp/TextureArticle.data'

const DOC_TYPE_PARAMS = ['article', 'TextureArticle 0.1.0', 'http://substance.io/TextureArticle-1.0.0.dtd']

export default createSchema(TextureArticleData, 'texture-article', '0.1.0', DOC_TYPE_PARAMS)
