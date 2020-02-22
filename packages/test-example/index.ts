import { TestTemplate } from './src/components/TestComponent'
import { render } from '@jumoku/jumoku'

const prop = {
  name: 'Chen Yihan',
  children: ['alice', 'bob', 'celina'],
  color: 'red',
  click: () => nnn()
}

function nnn() {
  alert(1)
}

// debugger

const walker = document.createTreeWalker(
  TestTemplate(prop).getTemplate().content,
  133
)

console.log(walker.currentNode)

while (walker.nextNode()) {
  let cur = walker.currentNode
  if (cur instanceof Element) {
    console.log(cur.attributes)
  }
  console.log(walker.currentNode)
}

render(TestTemplate(prop).getTemplate().content)

// import { html, LitElement, property, customElement } from 'lit-element'

// class TestTest extends LitElement {
//   @property() message = 'hi'

//   firstUpdated() {
//     let s = setInterval(() => {
//       this.message = this.message += 'i'
//     }, 1000)
//     setTimeout(() => {
//       clearInterval(s)
//     }, 6000)
//   }

//   render() {
//     debugger
//     const { message } = this
//     let res = html`
//       <div message="${message}">
//         ${message + 'iiii'}
//       </div>
//     `
//     return res
//   }
// }

// customElements.define('test-test', TestTest)

// document.querySelector('#app')?.appendChild(
//   document
//     .createRange()
//     .createContextualFragment(`<test-test>`)
//     .cloneNode(true)
// )