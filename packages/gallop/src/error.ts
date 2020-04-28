import { Primitive } from './utils'

export const LockedProxyError = (target: object) =>
  new Error(
    `Can not set new property to locked object "${JSON.stringify(target)}".`
  )

export const NotReactiveELementError = (name: string) =>
  new SyntaxError(`${name} element is not an Reactive Element`)

export const DirectiveCanNotUseError = (name: string) =>
  new SyntaxError(`${name} directive can only be used in NodePart`)

export const DuplicatedKeyError = (key: Primitive) =>
  new Error(`key ${String(key)} is Duplicated`)
