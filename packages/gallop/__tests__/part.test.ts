import { html, render } from '../src'

describe('part', () => {
  test('class bind', () => {
    const active = true
    const div = html`
      <div id="test-class" .class="${active ? 'active' : ''}"></div>
    `
    const remove = render(div)

    expect(
      document.querySelector('#test-class')?.classList.contains('active')
    ).toBe(true)
    remove()
  })

  test('style bind', () => {
    const color = 'red'
    const div = html`
      <div id="test-style" .style="${`background :${color}`}"></div>
    `
    const remove = render(div)

    expect(document.querySelector('#test-style')?.getAttribute('style')).toBe(
      `background :${color}`
    )
    remove()
  })

  test('value bind', () => {
    const value = 1
    const input = html` <input id="test-value" .value="${value}" /> `
    const remove = render(input)

    expect(
      Number((document.querySelector('#test-value') as HTMLInputElement).value)
    ).toBe(1)
    remove()
  })
})
