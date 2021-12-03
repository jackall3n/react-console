import { Context, ContextHelpers } from "../types/context";
import { getDirectory, toPath } from "../utils/directoryUtils";

export function cat({ context, addLines, throwError }: ContextHelpers, directory: string): Context {
  const { filesystem } = context;

  const { resolved, absolute } = toPath(context, directory);
  const { name } = absolute;

  const file = getDirectory(filesystem, resolved);

  if (!file) {
    return throwError(`${name}: No such file or directory`);
  }

  if (file.type !== 'file') {
    return throwError(`${name}: Is a directory`);
  }

  return addLines(file.contents?.split('\n') ?? [])
}
