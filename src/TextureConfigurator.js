import {
  Configurator, merge, flatten, forEach, Registry
} from 'substance'

export default class TextureConfigurator extends Configurator {
  constructor () {
    super()

    this.config.configurations = {}
    this.config.availableLanguages = {}
    this.config.propertyEditors = []
    this._compiledToolPanels = {}
  }

  static createFrom (parentConfig) {
    let ConfiguratorClass = this
    let config = new ConfiguratorClass()
    merge(config, parentConfig)
    return config
  }

  createScope (name) {
    let ConfiguratorClass = this.constructor
    let scope = new ConfiguratorClass()
    this.setConfiguration(name, scope)
    return scope
  }

  setConfiguration (name, config) {
    this.config.configurations[name] = config

    config._name = this._name ? this._name + '/' + name : name
  }

  getConfiguration (name) {
    return this.config.configurations[name]
  }

  getComponentRegistry () {
    if (!this.componentRegistry) {
      this.componentRegistry = super.getComponentRegistry()
    }
    return this.componentRegistry
  }

  getComponent (name) {
    return this.getComponentRegistry().get(name, 'strict')
  }

  addCommand (name, CommandClass, opts = {}) {
    super.addCommand(name, CommandClass, opts)
    if (opts.accelerator) {
      this.addKeyboardShortcut(opts.accelerator, { command: name })
    }
  }

  addTool (name, ToolClass) {
    throw new Error('This has been removed. Use addComponent(<command-name>, ToolClass) instead')
  }

  getToolRegistry () {
    let result = new Map()
    forEach(this.config.tools, (ToolClass, name) => {
      result.set(name, ToolClass)
    })
    return result
  }

  getToolClass (name) {
    return this.config.tools[name]
  }

  addToolPanel (name, spec) {
    this.config.toolPanels[name] = spec
  }

  getToolPanel (name, strict) {
    let toolPanelSpec = this.config.toolPanels[name]
    if (toolPanelSpec) {
      // return cache compiled tool-panels
      if (this._compiledToolPanels[name]) return this._compiledToolPanels[name]
      let toolPanel = toolPanelSpec.map(itemSpec => this._compileToolPanelItem(itemSpec))
      this._compiledToolPanels[name] = toolPanel
      return toolPanel
    } else if (strict) {
      throw new Error(`No toolpanel configured with name ${name}`)
    }
  }

  getCommands () {
    let commands = new Map()
    forEach(this.config.commands, (item, name) => {
      const Command = item.CommandClass
      let command = new Command(Object.assign({ name }, item.options))
      commands.set(name, command)
    })
    return commands
  }

  getCommandGroup (name) {
    let commandGroup = this.config.commandGroups[name]
    if (!commandGroup) {
      // console.warn('No command group registered by this name: ' + name)
      commandGroup = []
    }
    return commandGroup
  }

  registerLanguage (code, name) {
    this.config.availableLanguages[code] = name
  }

  getAvailableLanguages () {
    return this.config.availableLanguages
  }

  getConverters (type) {
    let registry = new Registry()
    forEach(this.config.converters[type], (Converter, type) => {
      registry.add(type, Converter)
    })
    return registry
  }

  _compileToolPanelItem (itemSpec) {
    let item = Object.assign({}, itemSpec)
    let type = itemSpec.type
    switch (type) {
      case 'command': {
        if (!itemSpec.name) throw new Error("'name' is required for type 'command'")
        break
      }
      case 'command-group':
        return this.getCommandGroup(itemSpec.name).map(commandName => {
          return {
            type: 'command',
            name: commandName
          }
        })
      case 'switcher':
      case 'prompt':
      case 'group':
      case 'dropdown':
        item.items = flatten(itemSpec.items.map(itemSpec => this._compileToolPanelItem(itemSpec)))
        break
      case 'separator':
      case 'spacer':
        break
      default:
        throw new Error('Unsupported tool panel item type: ' + type)
    }
    return item
  }
}
