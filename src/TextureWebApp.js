import TextureAppMixin from './TextureAppMixin'
import TextureWebAppChrome from './TextureWebAppChrome'

export default class TextureWebApp extends TextureAppMixin(TextureWebAppChrome) {
  _getDefaultDataFolder () {
    return './data/'
  }
}
