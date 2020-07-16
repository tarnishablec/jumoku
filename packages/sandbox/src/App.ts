import {
  html,
  render,
  component,
  Context,
  useEffect,
  useState,
  useMemo,
  ReactiveElement,
  repeat,
  useStyle,
  css,
  suspense
} from '@gallop/gallop'

import './styles/index'

export const [global, globalContext] = Context.initGlobal({ data: 1 })

component('test-app', function (
  this: ReactiveElement,
  { name = 'test-app-0' }: { name: string }
) {
  const [state] = useState({
    tick: 0,
    tok: 0,
    children: [1, 2, 3],
    map: new Map<number, number>()
  })

  useEffect(() => {
    console.log(`test-app mounted`)
  }, [])

  useEffect(() => {
    console.log(state.tick)
    return () => console.log(state.tick + '!!!')
  }, [state.tick])

  useEffect(() => {
    console.log(state.children)
  }, [state.children])

  useEffect(() => {
    console.log(this.$root.querySelector('button'))
  })

  const res = useMemo(() => {
    state.map.set(state.tok, state.tick)
    const result = state.map.get(state.tok)
    console.log(state.map)
    return result
  }, [state.tick, state.tok])

  const sum = useMemo(() => {
    console.log(`calculated`)
    return state.tick + state.tok
  }, [state.tick, state.tok])

  useStyle(
    () => css`
      button {
        background: ${'red'};
      }
    `,
    []
  )

  return html`
    <div @mouseenter="${() => console.log('hover')}" .style="${{ display: 'grid' }}">
      ${name}
    </div>
    <hr />
    <button
      @click="${() => {
        for (let i = 0; i < 100; i++) {
          state.tick++
        }
      }}"
    >
      add tick
    </button>
    <hr />
    <div>${state.tick}</div>
    <hr />
    <button @click="${() => state.tok++}">add tok</button>
    <hr />
    <div>${state.tok}</div>
    <hr />
    <button @click="${() => state.children.unshift(state.children.pop()!)}">
      circle move
    </button>
    <hr />
    <div>${res}</div>
    <hr />
    <div>${sum}</div>
    <hr />
    <div>
      ${repeat(
        state.children,
        (_, index) => index,
        (item) => html`<div>${item}</div>`
      )}
    </div>
    <hr />
    <div>
      ${html` <div>${state.tick}</div> `}
    </div>
    <hr />
    <div>
      ${suspense(
        () =>
          new Promise((res) => {
            setTimeout(() => {
              // rej(new Error(`error`))
              res(html`hello!`)
            }, 2000)
          }).then((res) => {
            console.log(res)
            return res
          }),
        { pending: `loading...`, fallback: `error!` }
      )}
    </div>
  `
})

render(html`
  <test-app :name="${'test-app-1'}"></test-app>
  <!-- \${dynamic('test-app', { name: 'test-app-2' })} -->
`)

// window.requestIdleCallback(() => {
//   console.log('ric')
//   // const end = new Date().getTime()
//   // console.log(end - start)
// })
// requestAnimationFrame(() => {
//   console.log('raf')
//   requestAnimationFrame(() => console.log('raf | raf'))
//   setTimeout(() => console.log('raf | set'), 0)
// })
// setTimeout(() => {
//   console.log('set')
//   setTimeout(() => console.log(`set | set`), 0)
//   requestAnimationFrame(() => console.log(`set | raf`))
// }, 0)
// console.log('normal')

// console.log('script start')

// async function async1() {
//   console.log(await 1)
//   await async2()
//   await async3()
//   console.log('async1 end')
// }
// async function async2() {
//   sync4()
//   console.log('async2 end')
//   return await async5()
// }
// async function async3() {
//   console.log('async3 end')
// }

// function sync4() {
//   console.log('sync4 end')
// }

// async function async5() {
//   console.log('async5 end')
// }

// async1()

// requestAnimationFrame(() => {
//   console.log('raf')
// })

// setTimeout(function () {
//   console.log('setTimeout')
// }, 0)

// new Promise((resolve) => {
//   console.log('Promise')
//   resolve()
// })
//   .then(function () {
//     console.log('promise1')
//   })
//   .then(function () {
//     console.log('promise2')
//   })

// console.log('script end')
