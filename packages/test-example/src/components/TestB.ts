import { createContext, component, useState, html } from '@jumoku/jumoku'
import './TestA'

export let [data, context] = createContext({
  tok: 1,
  children: [2, 4, 6, 8, 7, 10, 0, 22]
})

component('test-b', (name: string, age: number = 25) => {
  let [state] = useState({ tick: 1 })

  return html`
    <h3>name is ${name}; age is ${age}</h3>
    <div>${state.tick}</div>
    <button @click="${() => (state.tick += 1)}">tick +1</button>
    <hr />
    <div>${data.tok}</div>
    <button @click="${() => (data.tok += 1)}">tick +1</button>
  `.useContext([context])
})
