import { createMain, defineCommand } from 'citty'
import { args } from '@/args.ts'
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
        console.log(args)
    },
})

createMain(command)({})
