import type { IBranch } from './types'
import * as process from 'node:process'
import { cancel, isCancel, multiselect } from '@clack/prompts'

function getLocationHint(location: IBranch['location']): string {
    if (location.local && location.remote)
        return '本地 & 远程'
    if (location.local)
        return '本地'
    return '远程'
}

export async function selectBranches(branches: IBranch[]): Promise<IBranch[] | null> {
    const options = branches.map(branch => ({
        value: branch,
        label: branch.name,
        hint: getLocationHint(branch.location),
    }))

    const result = await multiselect({
        message: '选择需要删除的分支（空格选中，回车确认）',
        options,
        required: false,
    })

    if (isCancel(result)) {
        cancel('操作已取消。')
        process.exit(1)
    }

    return result as IBranch[]
}
