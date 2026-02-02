// DomainHunter Open Source Release
module.exports = {
    apps: [
        {
            name: 'domainhunter',
            script: 'npm',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 4003,
            },
        },
    ],
};
