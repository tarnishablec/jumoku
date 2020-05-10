/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  directive,
  Part,
  NodePart,
  DirectivePartTypeError,
  DirectiveFn
} from '@gallop/gallop'

import { Router, Route } from '@gallop/router'
import { match, parse, compile } from 'path-to-regexp'

export const routerView = directive(
  (props?: unknown): DirectiveFn =>
    function(part: Part) {
      if (!(part instanceof NodePart)) {
        throw DirectivePartTypeError(part.type)
      }

      const { startNode, endNode } = part.location
    },
  true
)
