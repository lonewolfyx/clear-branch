import type { IBranch, IConfig } from './types'
import * as process from 'node:process'
import { cancel, confirm, isCancel, multiselect, progress } from '@clack/prompts'
import { deleteBranch } from '@/git.ts'

function getLocationHint(location: IBranch['location']): string {
    if (location.local && location.remote)
        return 'local & remote'
    if (location.local)
        return 'local'
    return 'remote'
}

export async function selectBranches(branches: IBranch[]): Promise<IBranch[]> {
    const options = branches.map(branch => ({
        value: branch,
        label: branch.name,
        hint: getLocationHint(branch.location),
    }))

    const result = await multiselect({
        message: 'Select branches to delete (space to select, enter to confirm)',
        options,
        required: false,
    })

    if (isCancel(result)) {
        cancel('Operation cancelled.')
        process.exit(1)
    }

    return result as IBranch[]
}

export async function confirmBranches(branches: IBranch[]): Promise<boolean> {
    const list = branches.map(b => `${b.name} {${getLocationHint(b.location)}}`).join('\n')

    const result = await confirm({
        message: `Confirm deletion of the following branches?\n${list}`,
    }) as boolean

    if (isCancel(result) || !result) {
        cancel('Operation cancelled.')
        process.exit(1)
    }

    return result
}

export async function deleteBranches(config: IConfig, branches: IBranch[]): Promise<void> {
    const bar = progress({})
    bar.start('Deleting branches...')

    for (const branch of branches) {
        try {
            await deleteBranch(config, branch)
        }
        finally {
            bar.advance(1, `${branch.name} deleted`)
        }
    }

    bar.stop('Deletion completed.')
}
