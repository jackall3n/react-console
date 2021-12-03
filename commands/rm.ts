import { Context, ContextHelpers } from "../types/context";
import { deleteDirectory, getDirectory, toPath } from "../utils/directoryUtils";

export function rm({ context, addLines, throwError }: ContextHelpers, ...args: string[]): Context {
  const directories = args.filter(a => !a.startsWith('-'))

  if (!directories.length) {
    return throwError(`invalid arguments. usage: rm [FILE]`)
  }

  for (const directory of directories) {
    const { resolved, absolute } = toPath(context, directory);
    const { name } = absolute;

    const existing = getDirectory(context.filesystem, resolved);

    if (!existing) {
      return throwError(`${name}: No such file or directory`)
    }

    if (existing.type === 'folder' && !args.includes('-r')) {
      return throwError(`${name}: Is a directory`)
    }
  }

  let filesystem = context.filesystem

  for (const directory of directories) {
    const { resolved, absolute } = toPath(context, directory);
    const { name } = absolute;

    filesystem = deleteDirectory(filesystem, resolved)
  }

  return {
    ...context,
    filesystem
  };
}
