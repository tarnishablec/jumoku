import { HTMLClip, createPatcher, getVals } from './clip'
import { Patcher } from './patcher'
import { Obj, extractProps } from './utils'
import { Looper } from './loop'
import { createProxy } from './reactive'
import { Context } from './context'
import { unmountEffectMap } from './hooks'

export type Component = (...args: any[]) => HTMLClip

type RegisterOption = {
  extend?: keyof HTMLElementTagNameMap
  Inherit?: new () => HTMLElement
  shadow?: boolean
}

export interface ReactiveElement extends HTMLElement {
  $builder: Component
  $root: ReactiveElement | ShadowRoot
  $patcher?: Patcher
  $isReactive: boolean

  $props: Obj
  $state?: Obj
  $contexts: Set<Context<Obj>>

  $emit: InstanceType<typeof EventTarget>['dispatchEvent']
  $on: InstanceType<typeof EventTarget>['addEventListener']

  requestUpdate(): void
  dispatchUpdate(): void
}

export function component<F extends Component>(
  name: string,
  builder: F,
  {
    shadow = true,
    extend = undefined,
    Inherit = HTMLElement
  }: RegisterOption = {}
) {
  const clazz = class extends Inherit implements ReactiveElement {
    $builder = builder
    $root = shadow ? this.attachShadow({ mode: 'open' }) : this
    $patcher?: Patcher = undefined
    $props = createProxy(
      {},
      {
        onMut: () => this.requestUpdate()
      }
    )
    $contexts = new Set<Context<Obj>>()

    $emit = this.dispatchEvent
    $on = this.addEventListener

    $isReactive = true

    requestUpdate() {
      Looper.enUpdateQueue(this)
    }
    dispatchUpdate() {
      const clip = this.$builder.call(this, this.$props)
      if (!this.$patcher) {
        this.$patcher = clip.do(createPatcher)
        this.$root.append(this.$patcher.dof)
      }
      this.$patcher.patch(clip.do(getVals))
    }

    connectedCallback() {
      const staticProps = extractProps(this.attributes)
      mergeProps(this, staticProps)
      this.requestUpdate()

      Context.globalContext && Context.globalContext.watch(this)
    }
    disconnectedCallback() {
      unmountEffectMap.get(this)?.forEach((fn) => fn())
    }

    constructor() {
      super()
    }
  }
  customElements.define(name, clazz, { extends: extend })
}

export const isReactive = (node: Node): node is ReactiveElement =>
  Reflect.get(node, '$isReactive')

export const mergeProp = (
  node: ReactiveElement,
  name: string,
  value: unknown
) => Reflect.set(node.$props, name, value)

export const mergeProps = (node: ReactiveElement, value: unknown) =>
  Object.assign(node.$props, value)
