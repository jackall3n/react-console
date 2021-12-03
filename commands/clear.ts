import { Context, ContextHelpers } from "../types/context";

export function clear({ context }: ContextHelpers): Context {
  return {
    ...context,
    lines: []
  }
}
