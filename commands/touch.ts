import { Context, ContextHelpers } from "../types/context";
import { saveDirectory, getDirectory, toPath } from "../utils/directoryUtils";

export function touch({ context, addLines, throwError }: ContextHelpers, directory: string): Context {
  const { filesystem } = context;

  if (!directory) {
    return throwError(`invalid arguments. usage: touch [FILE]`)
  }

  const { resolved, absolute } = toPath(context, directory);
  const { name } = absolute;

  const existing = getDirectory(filesystem, resolved);

  if (existing) {
    return throwError(`${name}: File exists`)
  }

  return {
    ...context,
    filesystem: saveDirectory(filesystem, resolved, '')
  };
}
