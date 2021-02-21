const { exec } = require('child_process');
const {
    existsSync,
    mkdirSync
} = require('fs');
const {
    basename,
    extname,
    join,
    resolve
} = require('path');
const { sync: rimrafSync } = require('rimraf');

const basePath = resolve(__dirname, '../');
const buildPath = join(basePath, 'build');

const input = process.argv[2];
if (!input || input.length === 0) throw new Error('No input file path passed in as an argument.');

const inputName = basename(input, extname(input));
const inputPath = join(basePath, input);
if (!existsSync(inputPath)) throw new Error(`File ${input} does not exist.`);

rimrafSync(buildPath);
mkdirSync(buildPath);

async function compile(targetName, targetExt) {
    try {
        await new Promise((resolve, reject) => {
            const outputPath = join(buildPath, `${inputName}.${targetExt}`);
            const command = `archetype -t ${targetName} ${inputPath} > ${outputPath}`;
            exec(command, (error, stdout, stderr) => {
                if (error) reject(error);
                else resolve(stdout);
            });
        });
    } catch(e) {
        console.error(e);   
    }
}

const targets = {
    'michelson': 'tz',
    'michelson-storage': 'storage.tz',
    'markdown': 'md',
    'ligo': 'ligo',
    'smartpy': 'py',
    'whyml': 'mlw'
};

Promise.all(Object.keys(targets).map(targetName => {
    const targetExt = targets[targetName];
    return compile(targetName, targetExt);
}));