import React, { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import ReactMarkdown from 'react-markdown'

import commands, { CommandTree } from '../commands';
import { Context, ContextHelpers, Line } from "../types/context";
import { getDirectory, getResolvedPath, parsePath, saveDirectory } from "../utils/directoryUtils";

const FILESYSTEM = {
  Users: {
    jack: {
      '.git': {},
      'passwords.txt': `MY_PASSWORD=MyL1ttl3P0ny`,
      secrets: {},
      Documents: {
        [`bank_details`]: {},
        'cv.docx': true,
        'cv-v2.docx': true,
        'cv-v2-Final.docx': true,
        'cv-v2-Final-Final!!.docx': true
      },
      "contact_details.yaml": `email: [me@jackallen.me](mailto:me@jackallen.me)\nphone: 07880 880680\nsocial: nope`
    }
  }
}


const delay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));


const COMMANDS: CommandTree = {
  _({ addLines }, name) {
    return addLines([])
  },
  help({ addLines }) {
    return addLines("Type `y` or `yes` if you agree that JetBrains may use cookies and IP address to collect individual statistics and to provide you with personalized offers.");
  },
  werwer({ addLines }) {
    return addLines(`Email me at [me@jackallen.me](mailto:me@jackallen.me)!`)
  },
}

export function createLine(line: string, context: Context): Line {
  return {
    directory: context.directory,
    data: line
  }
}

export function createHelpers(context: Context, command: string): ContextHelpers {
  function addLines(lines: string | string[] | Line | Line[]) {
    const ctx = { ...context };

    const _lines = (Array.isArray(lines) ? lines : [lines]).map(line => {
      if (typeof line === 'string') {
        return {
          directory: context.directory,
          data: line
        }
      }

      return line;
    });

    ctx.lines = [...ctx.lines, ..._lines];

    return ctx;
  }

  function throwError(message: string) {
    return addLines(`${command}: ${message}`)
  }

  return {
    context,
    addLines,
    throwError
  }
}

function getHistory(context: Context): string[] {
  const resolved = getResolvedPath(context, '/Users/jack/.jsh_history');
  const file = getDirectory(context.filesystem, parsePath(resolved))
  return file?.contents?.split('\n') ?? []
}

function updateHistory(context: Context, contents: string[]) {
  const resolved = getResolvedPath(context, '/Users/jack/.jsh_history');
  return saveDirectory(context.filesystem, parsePath(resolved), contents.join('\n'))
}

export default function Home() {
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState<number>();
  const [allowInput, setAllowInput] = useState(false);
  const [context, setContext] = useState<Context>(() => {
    const lastLogin = typeof window === 'undefined'
      ? new Date()
      : parseISO(window.localStorage.getItem('LAST_LOGIN') ?? new Date().toISOString());

    return {
      lines: [],
      directory: '/Users/jack',
      profile: 'jack',
      lastLogin,
      filesystem: FILESYSTEM
    }
  });

  function saveHistory(command: string) {
    const history = getHistory(context);

    history.push(command);

    setContext(context => ({
      ...context,
      filesystem: updateHistory(context, history)
    }))
  }

  const history = useMemo(() => getHistory(context), [context]);

  useEffect(() => {
    setTimeout(() => {
      setContext(context => ({
        ...context,
        lines: [
          createLine(`Last login: ${format(context.lastLogin, 'eee MMM d HH:mm:ss')}`, context),
          createLine('You have mail.', context),
        ]
      }));

      setTimeout(() => {
        setAllowInput(true);
      }, 150);

    }, 500);

    localStorage.setItem('LAST_LOGIN', new Date().toISOString());

    function onDocumentClick() {
      const input = document.body.querySelector('#console') as HTMLInputElement;

      input?.focus();
    }

    document.addEventListener('click', onDocumentClick);

    return () => {
      document.removeEventListener('click', onDocumentClick)
    }
  }, []);

  useEffect(() => {
    if (historyIndex !== undefined) {
      const item = history[history.length - 1 - historyIndex];

      if (!item) {
        return;
      }

      setInput(item)
    }

    return
  }, [historyIndex])


  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!allowInput) {
      return;
    }

    setInput(event.target.value);
  }

  function parseCommand(input: string) {
    const segments = input.split(' ').map(s => s.trim()).filter(Boolean);

    if (!segments.length) {
      return
    }

    const [name, ...args] = segments;

    return {
      name,
      args
    }
  }

  async function handleCommand(input: string) {
    if (!input?.trim()) {
      return;
    }

    const { name, args } = parseCommand(input);

    console.log(name, args);

    setContext(context => {
      const cmd = commands[name] ?? COMMANDS[name];

      const helpers = createHelpers(context, name);

      try {
        if (!cmd) {
          throw new Error(`jsh: command not found: ${name}`)
        }

        saveHistory(input);
        setHistoryIndex(undefined)

        return cmd(helpers, ...args) ?? context;
      } catch (e) {
        return helpers.addLines(e.message)
      }
    })
  }

  async function onExecute(event: React.FormEvent<HTMLFormElement>) {
    event.stopPropagation();
    event.preventDefault();

    setAllowInput(false);
    setContext((context) => ({
      ...context,
      lines: [...context.lines, {
        user: true,
        data: input,
        directory: context.directory,
      }]
    }))
    setInput('')

    try {
      await handleCommand(input);
    } catch (e) {
      console.error(e);
    }

    setAllowInput(true);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Tab') {
      event.preventDefault();
    }

    if (event.key === 'c' && event.ctrlKey) {
      event.preventDefault();

      setContext((context) => ({
        ...context,
        lines: [...context.lines, {
          user: true,
          data: input,
          directory: context.directory,
        }]
      }));

      setInput('')
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      setHistoryIndex(index => {
        if (index === undefined) {
          return 0;
        }

        const updated = index + (event.key === 'ArrowUp' ? 1 : -1);

        const top = Math.max(history.length - 1, 0);
        const bottom = 0;

        return Math.min(Math.max(updated, bottom), top);
      });
    }
  }

  return (
    <div className="text-white grid grid-cols-1 font-mono px-3 py-2 text-sm" data-console={true}>
      {context.lines.map((line, index) => {
        if (line.user) {
          return (
            <div className="mt-3" key={index}>
              <div className="text-purple-500 text-xs font-bold">
                {line.directory
                  .replace(`/Users/${context.profile}`, '~')
                  .replace(`/users/${context.profile}`, '~')}
              </div>
              <div data-line={index} key={index} className="">
                <span className="mr-2 text-white text-opacity-50">$</span>
                <span className={`text-${line.color} line`}>
                  <ReactMarkdown linkTarget="_blank">
                    {String(line.data)}
                  </ReactMarkdown>
                </span>
              </div>
            </div>
          )
        }

        return (
          <div data-line={index} key={index}>
            <span className={`text-${line.color} line`}>
               <ReactMarkdown linkTarget="_blank">
                 {String(line.data)}
               </ReactMarkdown>
            </span>
          </div>
        )
      })}

      {!allowInput && (
        <input className="bg-transparent outline-none"
               id="console"
               value=""
               autoFocus
               onChange={console.log}
               autoComplete="off"
        />
      )}

      {allowInput && (
        <div className="mt-3">
          <div className="text-purple-500 text-xs font-bold">
            {context.directory
              .replace(`/Users/${context.profile}`, '~')
              .replace(`/users/${context.profile}`, '~')}
          </div>
          <div className="flex">
            <span className="mr-2 text-white text-opacity-50">$</span>
            <form className="flex-1 flex" onSubmit={onExecute}>
              <input className="flex-1 bg-transparent outline-none"
                     id="console"
                     value={input}
                     autoFocus
                     onChange={onChange}
                     autoComplete="off"
                     onKeyDown={onKeyDown}
              />
            </form>
          </div>
        </div>
      )}


    </div>
  )
}
