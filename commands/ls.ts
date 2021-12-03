import { Context, ContextHelpers } from "../types/context";
import { getDirectory, toPath } from "../utils/directoryUtils";

export function ls({ context, addLines, throwError }: ContextHelpers, ...args: string[]): Context {
  const { filesystem } = context;

  const [child] = args.filter(s => !s.startsWith('-'))

  const { resolved, absolute } = toPath(context, child);
  const { name } = absolute;

  const dir = getDirectory(filesystem, resolved);

  if (!dir) {
    return throwError(`${name}: No such file or directory`)
  }

  if (dir.type !== 'folder') {
    return addLines(name);
  }

  const items = dir.items.filter(item => {
    return !item.name.startsWith('.') || args.includes('-a')
  });

  return addLines(items.map(item => {
    const color = item.hidden ? 'gray-500' : item.type === 'file' ? 'purple-500' : undefined;

    return {
      directory: context.directory,
      data: item.type === 'folder' ? `drwx------ ${item.name}` : `-rw------- ${item.name}`,
      color
    }
  }))
}
