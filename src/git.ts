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

export async function getDefaultBranch(config: IConfig): Promise<string> {
    const result = await x('sh', [
        '-c',
        'git ls-remote --symref origin HEAD | sed -n \'s|ref: refs/heads/||p\' | awk \'{print $1}\'',
    ], {
        nodeOptions: {
            cwd: config.cwd,
        },
    })

    return result.stdout.trim()
}

export async function getBranches(config: IConfig): Promise<IBranch[]> {
    const defaultBranch = await getDefaultBranch(config)
    const locals = await getLocalBranches(config)
    const remotes = await getRemoteBranches(config)

    const map = new Map<string, IBranch>()

    for (const name of locals) {
        if (name === defaultBranch)
            continue
        map.set(name, { name, location: { local: true, remote: false } })
    }

    for (const name of remotes) {
        if (name === defaultBranch)
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

export async function deleteBranch(config: IConfig, branch: IBranch): Promise<void> {
    const commands: string[] = []

    if (branch.location.local)
        commands.push(`git branch -D ${branch.name}`)
    if (branch.location.remote) {
        commands.push(`git push origin --delete ${branch.name}`)
    }

    const command = commands.join(' && ')

    await x('sh', ['-c', command], {
        nodeOptions: {
            cwd: config.cwd,
        },
    })
}
