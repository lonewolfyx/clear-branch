export const args = {
    cwd: {
        type: 'string',
        description: 'Current working directory',
        alias: 'c',
        default: process.cwd(),
    },
    all: {
        type: 'boolean',
        description: 'Delete all branches',
        alias: 'a',
        default: false,
    },
} as const
