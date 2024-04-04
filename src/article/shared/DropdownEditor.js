import { ValueComponent } from '../../kit'

export default class DropdownEditor extends ValueComponent {
  render ($$) {
    const model = this.props.model
    const value = model.getValue()
    let el = $$('div').addClass(this._getClassNames())

    const dropdownSelector = $$('select').ref('input').addClass('se-select')
      .val(value)
      .on('click', this._suppressClickPropagation)
      .on('change', this._setValue)

    dropdownSelector.append(
      $$('option').append(this._getLabel())
    )

    this._getValues().forEach(l => {
      const option = $$('option').attr({ value: l.id }).append(l.name)
      if (l.id === value) option.attr({ selected: 'selected' })
      dropdownSelector.append(option)
    })

    el.append(dropdownSelector)

    return el
  }

  _getClassNames () {
    return 'sc-dropdown-editor'
  }

  _getLabel () {
    return this.getLabel('select-value')
  }

  _getValues () {
    return []
  }

  _setValue () {
    const model = this.props.model
    const input = this.refs.input
    const value = input.getValue()
    model.setValue(value)
  }

  _suppressClickPropagation (e) {
    e.stopPropagation()
  }
}
