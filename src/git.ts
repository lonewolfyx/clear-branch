import type { IBranch, IConfig } from './types'
import { x } from 'tinyexec'

async function git(config: IConfig, args: string): Promise<string> {
    const result = await x('git', args.split(' '), {
        nodeOptions: {
            cwd: config.cwd,
        },
    })
    return result.stdout.trim()
}

export async function getCurrentBranch(config: IConfig): Promise<string> {
    return git(config, 'rev-parse --abbrev-ref HEAD')
}

export async function getLocalBranches(config: IConfig): Promise<string[]> {
    const output = await git(config, 'branch --format=%(refname:short)')
    return output ? output.split('\n').filter(Boolean) : []
}

export async function getRemoteBranches(config: IConfig): Promise<string[]> {
    const output = await git(config, 'branch -r --format=%(refname:short)')
    return output
        ? output
                .split('\n')
                .filter(Boolean)
                .filter(b => b.startsWith('origin/') && b !== 'origin/HEAD')
                .map(b => b.slice('origin/'.length))
        : []
}

export async function getBranches(config: IConfig): Promise<IBranch[]> {
    const current = await getCurrentBranch(config)
    const locals = await getLocalBranches(config)
    const remotes = await getRemoteBranches(config)

    const map = new Map<string, IBranch>()

    for (const name of locals) {
        if (name === current)
            continue
        map.set(name, { name, location: { local: true, remote: false } })
    }

    for (const name of remotes) {
        if (name === current)
            continue
        const existing = map.get(name)
        if (existing) {
            existing.location.remote = true
        }
        else {
            map.set(name, { name, location: { local: false, remote: true } })
        }
    }

    return Array.from(map.values())
}
