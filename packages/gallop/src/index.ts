export { html } from './parse'
export { render } from './render'
export {
  component,
  UpdatableElement,
  VirtualElement,
  resolveCurrentHandle,
  setCurrentHandle,
  componentPool
} from './component'
export { createContext, Context } from './context'
export { useState, useEffect, useContext } from './hooks'
export { DoAble } from './do'
export { DynamicComponent } from './dynamic'
export { isProxy, isMarker } from './is'

export { repeat } from './directives'
export {
  directive,
  directives,
  checkIsNodePart,
  isDirective
} from './directive'

export type { Component, Complex } from './component'
export type { ReturnOf, ParamsOf } from './do'
export type { Effect } from './hooks'
export type { DirectiveFn } from './directive'
