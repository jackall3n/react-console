import { Context, ContextHelpers } from "../types/context";
import { getDirectory, toPath } from "../utils/directoryUtils";

export function cd({ context, addLines, throwError }: ContextHelpers, directory: string): Context {
  const { filesystem } = context;
  const path = toPath(context, directory || '~');

  const { resolved, absolute } = path;
  const { name } = absolute;

  console.log(path)

  const dir = getDirectory(filesystem, resolved);

  if (!dir) {
    return throwError(`no such file or directory: ${name}`)
  }

  if (dir.type !== 'folder') {
    return throwError(`not a directory: ${name}`)
  }

  return {
    ...context,
    directory: absolute.path
  }
}
