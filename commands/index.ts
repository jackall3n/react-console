import { Context, ContextHelpers } from "../types/context";
import { cat } from "./cat";
import { cd } from "./cd";
import { clear } from "./clear";
import { ls } from "./ls";
import { mkdir } from "./mkdir";
import { pwd } from "./pwd";
import { rm } from "./rm";
import { touch } from "./touch";

export type CommandTree = Record<string, (context: ContextHelpers, ...args: any[]) => Context | undefined>;

const commands: CommandTree = {
  cat,
  cd,
  clear,
  ls,
  pwd,
  touch,
  rm,
  mkdir
}

export default commands
