import { Obj } from './utils'
import { Looper } from './loop'
import { createProxy, dirtyCollectionSet } from './reactive'
import { Context } from './context'
import { ReactiveElement } from './component'

export function useState<T extends Obj>(raw: T): [T] {
  const current = Looper.resolveCurrent()
  return [
    current.$state
      ? (current.$state as T)
      : (current.$state = createProxy(raw, {
          onSet: () => current.requestUpdate()
        }))
  ]
}

export function useContext(contexts: Context<Obj>[]) {
  const current = Looper.resolveCurrent()
  contexts.forEach((ctx) => ctx.watch(current))
}

export let lastDepEl: ReactiveElement | undefined
export const resetLastDepEl = () => (lastDepEl = undefined)
let depCount: number
const depCountMap = new WeakMap<ReactiveElement, Map<number, unknown[]>>()
export function useDepends(depends?: unknown[]): [boolean, boolean, number] {
  const current = Looper.resolveCurrent()
  let diff: boolean = false
  if (current !== lastDepEl) {
    depCount = 0
    diff = true
  }
  if (!depends) {
    depCount++
    return [true, diff, depCount - 1]
  }
  const oldVals = depCountMap.get(current)?.get(depCount)
  let dirty = false
  if (!oldVals) {
    dirty = true
  } else {
    depends.forEach(
      (dep, i) =>
        ((dep instanceof Object &&
          (!Object.is(dep, oldVals[i]) || dirtyCollectionSet.has(dep))) ||
          !Object.is(dep, oldVals[i])) &&
        (dirty = true)
    )
  }
  !(
    depCountMap.get(current) ??
    depCountMap.set(current, new Map()).get(current)!
  ).set(depCount, depends)
  lastDepEl = current
  depCount++
  return [dirty, diff, depCount - 1]
}

type Effect = () => void | (() => void)
export const effectQueueMap = new WeakMap<
  ReactiveElement,
  (Effect | undefined)[]
>()
export const unmountEffectMap = new WeakMap<ReactiveElement, (() => void)[]>()
export function useEffect(effect: Effect, depends?: unknown[]) {
  const current = Looper.resolveCurrent()
  const [dirty, diff, count] = useDepends(depends)
  diff && effectQueueMap.set(current, [])
  dirty &&
    ((effectQueueMap.get(current) ??
      effectQueueMap.set(current, []).get(current))![count] = effect)
}
export const resolveEffects = (current: ReactiveElement) => {
  const effects = effectQueueMap.get(current)
  return (
    effects &&
    Promise.resolve().then(() => {
      const resList: (void | (() => void))[] =
        unmountEffectMap.get(current) ?? []
      effects.forEach((e, i) => {
        const res = e?.()
        res && (resList[i] = res)
      })
      return resList
    })
  )
}
