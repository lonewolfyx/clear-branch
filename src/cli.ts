import process from 'node:process'
import { cancel, confirm, intro, isCancel, outro, spinner } from '@clack/prompts'
import { createMain, defineCommand } from 'citty'
import pc from 'picocolors'
import { args } from '@/args.ts'
import { resolveConfig } from '@/config.ts'
import { getBranches } from '@/git.ts'
import { deleteBranches, selectBranches } from '@/prompt.ts'
import { description, name, version } from '../package.json'

const command = defineCommand({
    meta: {
        name,
        version,
        description,
    },
    setup() {
        intro(pc.bgCyan(` ${name} [v${version}]`))
    },
    cleanup() {
        outro('Done.')
    },
    args,
    async run({ args }) {
        const config = resolveConfig(args)

        const s = spinner()
        s.start('Retrieving branch list...')
        const branches = await getBranches(config)

        if (branches.length === 0) {
            s.stop('No branches found to delete')
            process.exit(1)
        }
        s.stop(`Find ${pc.red(branches.length)} branches`)

        if (config.all) {
            await deleteBranches(config, branches)
        }
        else {
            const selected = await selectBranches(branches)

            const confirmed = await confirm({
                message: `Confirm deletion of the following branches?`,
            }) as boolean

            if (isCancel(confirmed) || !confirmed) {
                cancel('Operation cancelled.')
                process.exit(1)
            }

            if (confirmed)
                await deleteBranches(config, selected)
        }
    },
})

createMain(command)({})
