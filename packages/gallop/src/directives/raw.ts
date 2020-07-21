import { directive, ensurePartType } from '../directive'
import { NodePart } from '../part'

export const raw = directive((htmlStr: string) => (part) => {
  if (!ensurePartType(part, NodePart)) return
  if (htmlStr === part.value) return
  part.clear()
  const node = new Range().createContextualFragment(htmlStr)
  const { endNode } = part.location
  endNode.parentNode!.insertBefore(node, endNode)
  part.value = htmlStr
})