import { Clip, HTMLClip, createInstance, getVals, getShaHtml } from './clip'
import { ReactiveElement, VirtualElement } from './component'
import { shallowEqual, twoStrArrayCompare, tryParseToString } from './utils'
import { generateEventOptions } from './event'
import { removeNodes } from './dom'
import { isDirective, directives } from './directive'

type AttrEventLocation = { node: Element; name: string }
type PropLocation = { node: ReactiveElement; name: string }
type NodeLocation = { startNode: Comment; endNode: Comment }

type PartLocation = AttrEventLocation | PropLocation | NodeLocation
type NodePartType = 'clip' | 'clips' | 'text' | 'element' | 'dirctive'
type PartType = 'node' | 'attr' | 'event' | 'prop' | NodePartType

export type NodeValueType = Clip | string | ReactiveElement | NodeValueType[]

const initValue = Symbol('')

export abstract class Part {
  index: number
  value: unknown = initValue
  location: PartLocation
  type: PartType

  constructor(index: number, location: PartLocation, type: PartType) {
    this.index = index
    this.location = location
    this.type = type
  }

  setValue(val: unknown) {
    if (shallowEqual(this.value, val)) {
      // console.log(`nothing changed`)
      return
    } else {
      this.value = val
      this.commit()
    }
  }
  abstract commit(): unknown
  abstract clear(): void
}

export class NodePart extends Part {
  clear(): void {
    this.shaHtmlCache = undefined
    const { startNode, endNode } = this.location
    const parent = startNode.parentNode!
    removeNodes(parent, startNode.nextSibling, endNode)
  }

  commit(): void {}

  setValue(val: unknown) {
    let pendingVal = val
    let isOverrided = false

    while (isDirective(pendingVal)) {
      if (directives.get(pendingVal)) {
        isOverrided = true
      }
      pendingVal = pendingVal(this)
    }

    if (isOverrided) {
      this.type = 'dirctive'
      return
    }
    const [newVal, isInit] = tryUpdateEntry(this.value, pendingVal)
    this.value = newVal
    if (isInit) {
      this.clear()
      const dof = extractDof(newVal)
      const { endNode } = this.location
      const parent = endNode.parentNode!
      parent.insertBefore(dof, endNode)
    }
    // if (pendingVal instanceof VirtualElement) {
    //   type = 'element'
    //   this.value = this.commitElement(type, pendingVal)
    // } else if (pendingVal instanceof HTMLClip) {
    //   type = 'clip'
    //   this.value = this.commitClip(type, pendingVal)
    // } else if (Array.isArray(pendingVal)) {
    //   type = 'clips'
    //   this.commmitClips(type, pendingVal)
    // } else {
    //   type = 'text'
    //   pendingVal !== this.value &&
    //     (this.value = this.commitText(type, tryParseToString(pendingVal)))
    // }
    // this.type = type
  }

  value!: NodeValueType
  location!: NodeLocation
  shaHtmlCache?: string;
  [key: string]: unknown //for directives
}

export class AttrPart extends Part {
  clear(): void {}
  commit(): void {
    const { node, name } = this.location
    let res: string
    let val = this.value ?? ''
    if (name === 'style') {
      res = `${this.styleCache ?? ''}${this.styleCache ? ';' : ''}${val}`
    } else {
      res = val
    }
    if (name === 'class') {
      let classes = this.value.split(' ').filter(Boolean)
      if (!twoStrArrayCompare(classes, this.classCache ?? [])) {
        node.classList.remove(...(this.classCache ?? []))
        node.classList.add(...classes)
        this.classCache = classes
      }
      return
    }
    if (name === 'value') {
      if (Reflect.get(node, 'value')) {
        Reflect.set(node, 'value', this.value)
      }
      return
    }
    node.setAttribute(name, res)
  }

  constructor(index: number, location: AttrEventLocation) {
    super(index, location, 'attr')
    const { node } = this.location
    const staticStyle = node.getAttribute('style')
    if (staticStyle) {
      this.styleCache = staticStyle
    }
  }

  value!: string
  location!: AttrEventLocation
  styleCache?: string
  classCache?: string[]
}

type EventInstance = (e: Event) => unknown

export class EventPart extends Part {
  clear(): void {
    this.eventCache.forEach((val) => {
      this.location.node.removeEventListener(this.eventName, val, this.options)
    })
    this.eventCache.clear()
  }

  commit(): void {
    this.clear()
    const { node } = this.location
    this.value.forEach((v) => {
      let ev = this.tryGetFromCache(v)
      node.addEventListener(this.eventName, ev, this.options)
    })
  }

  setValue(val: EventInstance | EventInstance[]) {
    let temp: string[]
    if (Array.isArray(val)) {
      temp = val.map((v) => v?.toString())
    } else {
      temp = [val.toString()]
    }
    if (!twoStrArrayCompare(temp, Array.from(this.eventCache.keys()))) {
      this.value = Array.isArray(val) ? val : [val]
      this.commit()
    }
  }

  tryGetFromCache(e: EventInstance) {
    return (
      this.eventCache.get(e.toString()) ??
      this.eventCache.set(e.toString(), e).get(e.toString())!
    )
  }

  constructor(index: number, location: AttrEventLocation) {
    super(index, location, 'event')
    const { name } = this.location
    const [eventName, ...opts] = name.split('.')
    this.options = generateEventOptions(new Set(opts))
    this.eventName = eventName as keyof DocumentEventMap
  }

  value!: EventInstance[]
  location!: AttrEventLocation
  eventName: keyof DocumentEventMap
  eventCache: Map<string, EventInstance> = new Map()
  options: AddEventListenerOptions
}

export class PropPart extends Part {
  clear(): void {
    throw new Error('Method not implemented.')
  }
  commit(): void {
    const { name, node } = this.location
    if (name !== '$props') {
      node.mergeProp(name, this.value)
    } else {
      node.mergeProps(this.value as unknown[])
    }
  }

  constructor(index: number, location: PropLocation) {
    super(index, location, 'prop')
  }

  location!: PropLocation
}

////////////////

export function initEntry(val: VirtualElement): ReactiveElement
export function initEntry(val: HTMLClip): Clip
export function initEntry(val: unknown[]): NodeValueType[]
export function initEntry(val: unknown): NodeValueType
export function initEntry(val: unknown): NodeValueType {
  if (Array.isArray(val)) {
    const res: NodeValueType[] = []
    val.forEach((v) => {
      res.push(initEntry(v))
    })
    return res
  } else if (val instanceof HTMLClip) {
    const clip = val.do(createInstance)
    clip.tryUpdate(val.do(getVals))
    return clip
  } else if (val instanceof VirtualElement) {
    return val.createInstance()
  } else {
    return tryParseToString(val)
  }
}

export function tryUpdateEntry(
  pre: NodeValueType,
  val: unknown
): [NodeValueType, boolean] {
  if (pre instanceof Clip && val instanceof HTMLClip) {
    if (val.do(getShaHtml) === pre.shaHtml) {
      return [pre.tryUpdate(val.do(getVals)), false]
    }
  } else if (pre instanceof ReactiveElement && val instanceof VirtualElement) {
    if (pre.localName === val.tag) {
      return [pre.mergeProps(val.props), false]
    }
  } else if (Array.isArray(val)) {
    return [initEntry(val), true]
  } else if (
    typeof pre === 'string' &&
    !(val instanceof VirtualElement || val instanceof HTMLClip)
  ) {
    const str = tryParseToString(val)
    if (pre === str) {
      return [pre, false]
    } else {
      return [str, true]
    }
  }
  return [initEntry(val), true]
}

export function extractDof(val: NodeValueType) {
  const dof = new DocumentFragment()
  if (Array.isArray(val)) {
    val.forEach((v) => {
      dof.append(extractDof(v))
    })
  } else if (val instanceof ReactiveElement) {
    dof.append(val)
  } else if (val instanceof Clip) {
    dof.append(val.dof)
  } else {
    dof.append(val)
  }
  return dof
}
