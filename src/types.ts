import type { ParsedArgs } from 'citty'
import type { args } from '@/args.ts'

type DeepWriteable<T> = {
    -readonly [P in keyof T]: T[P] extends object ? DeepWriteable<T[P]> : T[P];
}

export type CommandArgs = ParsedArgs<DeepWriteable<typeof args>>

export interface IConfig {
    cwd: string
}

export interface IBranch {
    name: string
    location: {
        local: boolean
        remote: boolean
    }
}
