import { createMain, defineCommand } from 'citty'
import { args } from '@/args.ts'
import { resolveConfig } from '@/config.ts'
import { description, name, version } from '../package.json'

const command = defineCommand({
    meta: {
        name,
        version,
        description,
    },
    setup() {
        console.log('Setup')
    },
    cleanup() {
        console.log('Cleanup')
    },
    args,
    async run({ args }) {
        const config = resolveConfig(args)
    },
})

createMain(command)({})
