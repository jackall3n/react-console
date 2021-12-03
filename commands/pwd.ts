import { Context, ContextHelpers } from "../types/context";

export function pwd({ context, addLines }: ContextHelpers): Context {
  return addLines([context.directory])
}
