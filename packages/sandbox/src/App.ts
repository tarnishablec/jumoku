import {
  render,
  html,
  component,
  useState,
  useEffect,
  useMemo,
  ReactiveElement,
  dynamic,
  repeat,
  keep,
  setAlive
} from '@gallop/gallop'

component('test-b', ({ text }: { text: string }) => {
  const [state] = useState({ b: 1 })

  return html`<div>
    this is test b&nbsp;${text}
    <br/>
    state is ${state.b}
    <div>
      <slot>
    </div>
    <div>
      <button @click="${() => state.b++}">state ++</button>
    </div>
  </div>`
})

component('test-mmm', function (this: ReactiveElement) {
  const [state] = useState({
    a: 1,
    b: 2,
    arr: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    checked: false
  })

  const { a, b } = state
  const memo = useMemo(() => a + b, [a, b])

  useEffect(() => {
    setTimeout(() => this.queryRoot<HTMLButtonElement>('button').click(), 1000)
  }, [])

  return html`
    <div>${memo}</div>
    <button
      @click="${() => {
        state.a++
      }}"
    >
      a ++
    </button>
    <button
      @click="${() => {
        state.b++
      }}"
    >
      b ++
    </button>
    <div>
      ${dynamic({
        name: 'test-b',
        props: { text: 'haha' },
        inner: html` <div>${memo} in test-b slot</div> `
      })}
    </div>
    <hr />
    <div>
      <button
        @click="${() => {
          state.arr.unshift(state.arr.pop()!)
          console.log(state.arr)
        }}"
      >
        circle move to start
      </button>
    </div>
    <div>
      ${repeat(
        state.arr,
        (item) => item,
        (item) => html` <div @click="${() => console.log(item)}">${item}</div>`
      )}
    </div>
    <hr />
    <div>
      <input
        type="checkbox"
        .checked="${state.checked}"
        @input="${(e: Event) => {
          const target = e.target as HTMLInputElement
          state.checked = target.checked
        }}"
      />
      ${state.checked}
      <button @click="${() => (state.checked = !state.checked)}">
        toggle checked
      </button>
    </div>
    <hr />
    <div>
      <div>keepalive</div>
      ${keep(
        a % 2
          ? html`
              <test-b :text="${state.a}"></test-b>
              <hr />
              <test-b :text="${state.b}"></test-b>
            `.do(setAlive, +true)
          : null
      )}
    </div>
  `
})

render(html` <test-mmm></test-mmm> `)
