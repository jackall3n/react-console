
export type Line = {
  user?: boolean;
  directory: string;
  data: string;
  color?: string;
}

export type Context = {
  lines: Line[];
  directory: string;
  profile: string;
  lastLogin: Date;
  filesystem: Record<string, any>;
}

export type ContextHelpers = {
  context: Context;
  addLines(string: string | string[] | Line | Line[]): Context;
  throwError(message: string): Context;
}
