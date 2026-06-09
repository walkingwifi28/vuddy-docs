import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, cpSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { tmpdir } from 'node:os';

const rootDir = process.cwd();
const pagesDir = join(rootDir, 'pages');
const siteDir = join(rootDir, '_site');

if (!existsSync(pagesDir)) {
  throw new Error('pages directory does not exist');
}

function findIndexMarkdownFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...findIndexMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name === 'index.md') {
      files.push(fullPath);
    }
  }

  return files;
}

function findStaticFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...findStaticFiles(fullPath));
    } else if (
      entry.isFile()
      && (entry.name === 'index.html' || entry.name.endsWith('.pdf'))
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

function toUrlPath(path) {
  return path.split(sep).join('/');
}

function relativeFromOutputToSiteRoot(output) {
  const relativePath = toUrlPath(relative(dirname(output), siteDir));
  return relativePath === '' ? '.' : relativePath;
}

const inputs = findIndexMarkdownFiles(pagesDir).sort();

if (inputs.length === 0) {
  throw new Error('no pages/**/index.md files found');
}

rmSync(siteDir, { recursive: true, force: true });
mkdirSync(siteDir, { recursive: true });

cpSync(join(rootDir, 'assets', 'favicon.png'), join(siteDir, 'favicon.png'));
cpSync(join(rootDir, 'assets', 'images'), join(siteDir, 'assets', 'images'), { recursive: true });
cpSync(join(rootDir, 'assets', 'fonts'), join(siteDir, 'assets', 'fonts'), { recursive: true });

const resetCss = readFileSync(join(rootDir, 'assets', 'css', 'reset.css'), 'utf8');
const styleCss = readFileSync(join(rootDir, 'assets', 'css', 'style.css'), 'utf8')
  .split(/\r?\n/)
  .filter((line) => line !== '@import "reset.css";')
  .join('\n');
const stylePath = join(tmpdir(), 'md2vhtml-style.css');
writeFileSync(stylePath, `${resetCss}\n${styleCss}`);

for (const input of inputs) {
  const output = join(siteDir, relative(pagesDir, input).replace(/\.md$/, '.html'));
  mkdirSync(dirname(output), { recursive: true });

  const result = spawnSync(
    'npx',
    ['--yes', 'md2vhtml@latest', '-i', input, '-c', stylePath, '-s', join(rootDir, 'assets', 'js', 'main.js'), '-o', output],
    {
      shell: process.platform === 'win32',
      stdio: 'inherit',
    },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  let html = readFileSync(output, 'utf8');
  const siteRoot = relativeFromOutputToSiteRoot(output);

  if (!/<title>/i.test(html)) {
    html = html.replace('</head>', '    <title>Vuddyサービス資料</title>\n  </head>');
  }

  if (!/rel=["']icon["']/i.test(html)) {
    html = html.replace('</head>', `    <link rel="icon" type="image/png" href="${siteRoot}/favicon.png">\n  </head>`);
  }

  html = html
    .replaceAll('src="/assets/', `src="${siteRoot}/assets/`)
    .replaceAll('href="/assets/', `href="${siteRoot}/assets/`)
    .replaceAll('url("/assets/', `url("${siteRoot}/assets/`)
    .replaceAll("url('/assets/", `url('${siteRoot}/assets/`);

  writeFileSync(output, html);
}

const staticFiles = findStaticFiles(pagesDir).sort();
for (const input of staticFiles) {
  const output = join(siteDir, relative(pagesDir, input));
  mkdirSync(dirname(output), { recursive: true });
  cpSync(input, output);
}

const legacyImgDir = join(rootDir, 'img');
if (existsSync(legacyImgDir)) {
  cpSync(legacyImgDir, join(siteDir, 'img'), { recursive: true });
}

console.log(`Built ${inputs.length} markdown page${inputs.length === 1 ? '' : 's'} and copied ${staticFiles.length} static file${staticFiles.length === 1 ? '' : 's'} into ${relative(rootDir, siteDir).split(sep).join('/')}`);
