import { Context } from "../types/context";
import { get, orderBy, set } from "lodash";

export function getDirectoryType(file: any) {
  return typeof file === 'object' ? 'folder' : 'file'
}

export type Path = {
  name: string;
  path: string;
  parent: string;
}

export function toPath(context: Context, directory: string) {
  const absolute = getAbsolutePath(context, directory);
  const resolved = getResolvedPath(context, absolute);

  return {
    resolved: parsePath(resolved),
    absolute: parsePath(absolute)
  }
}

export function getResolvedPath(context: Context, path: string) {
  if (path === '/') {
    return path
  }

  let current = context.filesystem;

  const levels = [];

  for (const segment of path.split('/').filter(Boolean)) {
    const keys = Object.keys(current);
    const key = keys.find(key => key.toLowerCase() === segment.toLowerCase());

    levels.push(key ?? segment);
    current = current[key];
  }

  return levels.join('/')
}

export function getDirectory(filesystem: any, path: Path) {
  const getter = path.parent.replace(/\//gmi, '.');
  let result = getter === '.' || !getter ? filesystem : get(filesystem, getter);

  if (path.name) {
    result = result?.[path.name];
  }

  if (!result) {
    return undefined;
  }

  const type = getDirectoryType(result);

  const items = type === 'folder' ? Object.entries(result).map(([key, item]) => ({
    name: key,
    hidden: key.startsWith('.'),
    type: getDirectoryType(item)
  })) : undefined;

  return {
    type,
    items: orderBy(items, 'name'),
    contents: type === 'folder' ? undefined : result
  };
}

export function saveDirectory(filesystem: any, path: Path, contents: any) {
  const getter = path.parent.replace(/\//gmi, '.');
  const base = getter === '.' || !getter;
  const result = base ? filesystem : get(filesystem, getter);

  console.log(filesystem, path, result);

  result[path.name] = contents;

  return base ? filesystem : set(filesystem, getter, result)
}

export function deleteDirectory(filesystem: any, path: Path) {
  const getter = path.parent.replace(/\//gmi, '.');
  const base = getter === '.' || !getter;
  const result = base ? filesystem : get(filesystem, getter);

  delete result[path.name]

  return base ? filesystem : set(filesystem, getter, result)
}

export function getAbsolutePath(context: Context, path: string) {
  if (!path) {
    path = context.directory;
  }

  if (path.startsWith('~')) {
    path = path.replace('~', `/Users/${context.profile}`)
  }
  //
  // if (path.match(/^[.]+$/gmi)) {
  //   const dots = path.split('');
  //   const segments = context.directory.split('/');
  //
  //
  //   segments.splice(segments.length - 1 + (dots.length - 1), segments.length);
  //
  //   path = segments.join('/')
  //
  //   console.log({ path, segments });
  // }

  if (!path.startsWith('/')) {
    path = `${context.directory}/${path}`
  }

  path = path.replace(/\/\//gmi, '.');

  return path
}


export function parsePath(path: string): Path {
  const segments = path.split('/');
  const name = segments.pop();
  const parent = segments.join('/')

  return {
    parent,
    name,
    path
  }
}
