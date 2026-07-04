import type { CommandArgs, IConfig } from './types'

export function resolveConfig(args: CommandArgs): IConfig {
    return {
        cwd: args.cwd,
        all: args.all,
    }
}
