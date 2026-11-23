import type { ProviderKind } from '@launcher/client'

export const LAUNCHER_ICONS = {
  alert: 'i-launcher-alert',
  appearance: 'i-launcher-appearance',
  arrowDown: 'i-launcher-arrow-down',
  arrowLeft: 'i-launcher-arrow-left',
  arrowRight: 'i-launcher-arrow-right',
  arrowUp: 'i-launcher-arrow-up',
  arrowUpRight: 'i-launcher-arrow-up-right',
  bot: 'i-launcher-bot',
  chartColumn: 'i-launcher-chart-column',
  check: 'i-launcher-check',
  chevronDown: 'i-launcher-chevron-down',
  chevronRight: 'i-launcher-chevron-right',
  cloudUpload: 'i-launcher-cloud-upload',
  command: 'i-launcher-command',
  compose: 'i-launcher-compose',
  copy: 'i-launcher-copy',
  cornerDownRight: 'i-launcher-corner-down-right',
  ellipsis: 'i-launcher-ellipsis',
  eye: 'i-launcher-eye',
  eyeOff: 'i-launcher-eye-off',
  file: 'i-launcher-file',
  fileDiff: 'i-launcher-file-diff',
  folder: 'i-launcher-folder',
  folderNew: 'i-launcher-folder-new',
  fork: 'i-launcher-fork',
  gauge: 'i-launcher-gauge',
  gitBranch: 'i-launcher-git-branch',
  gitCommitHorizontal: 'i-launcher-git-commit-horizontal',
  globe: 'i-launcher-globe',
  github: 'i-launcher-github',
  hourglass: 'i-launcher-hourglass',
  info: 'i-launcher-info',
  laptop: 'i-launcher-laptop',
  list: 'i-launcher-list',
  loaderCircle: 'i-launcher-loader-circle',
  lock: 'i-launcher-lock',
  lockOpen: 'i-launcher-lock-open',
  package: 'i-launcher-package',
  paperclip: 'i-launcher-paperclip',
  panelLeft: 'i-launcher-panel-left',
  panelRight: 'i-launcher-panel-right',
  pencil: 'i-launcher-pencil',
  plus: 'i-launcher-plus',
  queue: 'i-launcher-queue',
  rotateCw: 'i-launcher-rotate-cw',
  rewind: 'i-launcher-rewind',
  search: 'i-launcher-search',
  server: 'i-launcher-server',
  settings: 'i-launcher-settings',
  sparkle: 'i-launcher-sparkle',
  star: 'i-launcher-star',
  starFilled: 'i-launcher-star-filled',
  stop: 'i-launcher-stop',
  target: 'i-launcher-target',
  stopFilled: 'i-launcher-stop-filled',
  terminal: 'i-launcher-terminal',
  terminalSquare: 'i-launcher-terminal-square',
  trash: 'i-launcher-trash',
  wrench: 'i-launcher-wrench',
  x: 'i-launcher-x',
  zap: 'i-launcher-zap',
} as const

export type LauncherIconName = keyof typeof LAUNCHER_ICONS

export function LauncherIcon({
  name,
  className,
  label,
}: {
  name: LauncherIconName
  className?: string
  label?: string
}) {
  return (
    <span
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={`inline-grid size-4 shrink-0 place-items-center ${className ?? ''}`}
      role={label ? 'img' : undefined}
    >
      <span
        aria-hidden="true"
        className={LAUNCHER_ICONS[name]}
        style={{ width: '100%', height: '100%' }}
      />
    </span>
  )
}

const FILE_TYPE_ICONS = {
  angular: 'i-launcher-file-type-angular',
  astro: 'i-launcher-file-type-astro',
  audio: 'i-launcher-file-type-audio',
  babel: 'i-launcher-file-type-babel',
  biome: 'i-launcher-file-type-biome',
  bun: 'i-launcher-file-type-bun',
  c: 'i-launcher-file-type-c',
  certificate: 'i-launcher-file-type-certificate',
  clojure: 'i-launcher-file-type-clojure',
  cmake: 'i-launcher-file-type-cmake',
  coffee: 'i-launcher-file-type-coffee',
  console: 'i-launcher-file-type-console',
  cpp: 'i-launcher-file-type-cpp',
  crystal: 'i-launcher-file-type-crystal',
  csharp: 'i-launcher-file-type-csharp',
  css: 'i-launcher-file-type-css',
  dart: 'i-launcher-file-type-dart',
  database: 'i-launcher-file-type-database',
  deno: 'i-launcher-file-type-deno',
  diff: 'i-launcher-file-type-diff',
  docker: 'i-launcher-file-type-docker',
  editorconfig: 'i-launcher-file-type-editorconfig',
  elixir: 'i-launcher-file-type-elixir',
  elm: 'i-launcher-file-type-elm',
  erlang: 'i-launcher-file-type-erlang',
  eslint: 'i-launcher-file-type-eslint',
  exe: 'i-launcher-file-type-exe',
  file: 'i-launcher-file-type-file',
  firebase: 'i-launcher-file-type-firebase',
  git: 'i-launcher-file-type-git',
  gitlab: 'i-launcher-file-type-gitlab',
  go: 'i-launcher-file-type-go',
  gradle: 'i-launcher-file-type-gradle',
  graphql: 'i-launcher-file-type-graphql',
  haskell: 'i-launcher-file-type-haskell',
  haxe: 'i-launcher-file-type-haxe',
  helm: 'i-launcher-file-type-helm',
  html: 'i-launcher-file-type-html',
  image: 'i-launcher-file-type-image',
  java: 'i-launcher-file-type-java',
  javascript: 'i-launcher-file-type-javascript',
  jinja: 'i-launcher-file-type-jinja',
  json: 'i-launcher-file-type-json',
  julia: 'i-launcher-file-type-julia',
  kotlin: 'i-launcher-file-type-kotlin',
  kubernetes: 'i-launcher-file-type-kubernetes',
  lock: 'i-launcher-file-type-lock',
  lua: 'i-launcher-file-type-lua',
  makefile: 'i-launcher-file-type-makefile',
  markdown: 'i-launcher-file-type-markdown',
  nest: 'i-launcher-file-type-nest',
  next: 'i-launcher-file-type-next',
  nginx: 'i-launcher-file-type-nginx',
  nix: 'i-launcher-file-type-nix',
  nodejs: 'i-launcher-file-type-nodejs',
  npm: 'i-launcher-file-type-npm',
  nuxt: 'i-launcher-file-type-nuxt',
  ocaml: 'i-launcher-file-type-ocaml',
  pdf: 'i-launcher-file-type-pdf',
  perl: 'i-launcher-file-type-perl',
  php: 'i-launcher-file-type-php',
  pnpm: 'i-launcher-file-type-pnpm',
  powershell: 'i-launcher-file-type-powershell',
  prettier: 'i-launcher-file-type-prettier',
  prisma: 'i-launcher-file-type-prisma',
  proto: 'i-launcher-file-type-proto',
  pug: 'i-launcher-file-type-pug',
  python: 'i-launcher-file-type-python',
  react: 'i-launcher-file-type-react',
  readme: 'i-launcher-file-type-readme',
  rollup: 'i-launcher-file-type-rollup',
  ruby: 'i-launcher-file-type-ruby',
  rust: 'i-launcher-file-type-rust',
  sass: 'i-launcher-file-type-sass',
  scala: 'i-launcher-file-type-scala',
  settings: 'i-launcher-file-type-settings',
  solidity: 'i-launcher-file-type-solidity',
  storybook: 'i-launcher-file-type-storybook',
  stylelint: 'i-launcher-file-type-stylelint',
  supabase: 'i-launcher-file-type-supabase',
  svelte: 'i-launcher-file-type-svelte',
  svg: 'i-launcher-file-type-svg',
  swift: 'i-launcher-file-type-swift',
  tailwindcss: 'i-launcher-file-type-tailwindcss',
  terraform: 'i-launcher-file-type-terraform',
  tex: 'i-launcher-file-type-tex',
  turborepo: 'i-launcher-file-type-turborepo',
  typescript: 'i-launcher-file-type-typescript',
  video: 'i-launcher-file-type-video',
  vite: 'i-launcher-file-type-vite',
  vitest: 'i-launcher-file-type-vitest',
  vue: 'i-launcher-file-type-vue',
  webassembly: 'i-launcher-file-type-webassembly',
  webpack: 'i-launcher-file-type-webpack',
  xaml: 'i-launcher-file-type-xaml',
  xml: 'i-launcher-file-type-xml',
  yaml: 'i-launcher-file-type-yaml',
  yarn: 'i-launcher-file-type-yarn',
  zig: 'i-launcher-file-type-zig',
  zip: 'i-launcher-file-type-zip',
} as const

type FileTypeIconName = keyof typeof FILE_TYPE_ICONS

export function FileTypeIcon({
  path,
  className,
}: {
  path: string
  className?: string
}) {
  const name = fileTypeIconName(path)
  return (
    <span
      aria-hidden="true"
      className={`inline-grid size-4 shrink-0 place-items-center ${className ?? ''}`}
    >
      <span className={FILE_TYPE_ICONS[name]} style={{ width: '100%', height: '100%' }} />
    </span>
  )
}

function fileTypeIconName(path: string): FileTypeIconName {
  const name = path.split(/[\\/]/).at(-1)?.toLocaleLowerCase() ?? path.toLocaleLowerCase()
  if (name.startsWith('readme')) return 'readme'
  if (/^(license|licence|copying)/.test(name)) return 'certificate'
  if (name.startsWith('dockerfile') || name.startsWith('compose.')) return 'docker'
  if (name === 'cmakelists.txt' || name.startsWith('cmake.')) return 'cmake'
  if (name === 'makefile' || name.startsWith('makefile.') || name === 'justfile') return 'makefile'
  if (['cargo.toml', 'cargo.lock', 'rust-toolchain.toml'].includes(name)) return 'rust'
  if (['go.mod', 'go.sum', 'go.work'].includes(name)) return 'go'
  if (name === 'pyproject.toml' || name === 'pipfile' || name.startsWith('requirements')) return 'python'
  if (['bun.lock', 'bun.lockb', 'bunfig.toml'].includes(name)) return 'bun'
  if (name.startsWith('pnpm-') || name === '.pnpmfile.cjs') return 'pnpm'
  if (name === 'yarn.lock' || name.startsWith('.yarnrc')) return 'yarn'
  if (name === 'package.json') return 'nodejs'
  if (name === 'package-lock.json') return 'npm'
  if (name === 'tsconfig.json' || name.startsWith('tsconfig.')) return 'typescript'
  if (name === 'jsconfig.json' || name.startsWith('jsconfig.')) return 'javascript'
  if (['.gitignore', '.gitattributes', '.gitmodules', '.gitconfig'].includes(name)) return 'git'
  if (name === '.editorconfig') return 'editorconfig'
  if (name.startsWith('.env')) return 'settings'
  if (name.startsWith('.prettier') || name.startsWith('prettier.config.')) return 'prettier'
  if (name.startsWith('.eslint') || name.startsWith('eslint.config.')) return 'eslint'
  if (name.startsWith('biome.json')) return 'biome'
  if (name.startsWith('.babel') || name.startsWith('babel.config.')) return 'babel'
  if (name.startsWith('.stylelint') || name.startsWith('stylelint.config.')) return 'stylelint'
  if (name.startsWith('vite.config.')) return 'vite'
  if (name.startsWith('vitest.config.') || name.startsWith('vitest.workspace.')) return 'vitest'
  if (name.startsWith('webpack.')) return 'webpack'
  if (name.startsWith('rollup.config.')) return 'rollup'
  if (name.startsWith('next.config.') || name === 'next-env.d.ts') return 'next'
  if (name.startsWith('nuxt.config.') || name === '.nuxtrc') return 'nuxt'
  if (name.startsWith('astro.config.')) return 'astro'
  if (name === 'angular.json' || name.endsWith('.component.ts')) return 'angular'
  if (name === 'nest-cli.json') return 'nest'
  if (name.startsWith('tailwind.config.')) return 'tailwindcss'
  if (name.startsWith('svelte.config.')) return 'svelte'
  if (name.startsWith('vue.config.')) return 'vue'
  if (name === 'firebase.json' || name === '.firebaserc') return 'firebase'
  if (name === 'supabase.toml') return 'supabase'
  if (name.startsWith('prisma.config.')) return 'prisma'
  if (name === 'turbo.json') return 'turborepo'
  if (name.startsWith('deno.json') || name === 'deno.lock') return 'deno'
  if (name === '.gitlab-ci.yml' || name === '.gitlab-ci.yaml') return 'gitlab'
  if (name === 'kustomization.yaml' || name === 'kustomization.yml') return 'kubernetes'
  if (name === 'chart.yaml' || name === 'values.yaml') return 'helm'
  if (name === 'nginx.conf') return 'nginx'
  if (name === '.nvmrc' || name === '.node-version') return 'nodejs'
  if (['build.gradle', 'settings.gradle', 'gradlew', 'gradlew.bat'].includes(name)) return 'gradle'
  if (name.includes('.stories.') || name.includes('.story.')) return 'storybook'
  if (name === 'gemfile' || name === 'gemfile.lock') return 'ruby'
  if (name === 'pom.xml') return 'java'

  const extension = name.includes('.') ? name.split('.').at(-1) ?? '' : ''
  if (extension === 'rs') return 'rust'
  if (['js', 'mjs', 'cjs'].includes(extension)) return 'javascript'
  if (['ts', 'mts', 'cts'].includes(extension)) return 'typescript'
  if (['jsx', 'tsx'].includes(extension)) return 'react'
  if (['py', 'pyi', 'pyw'].includes(extension)) return 'python'
  if (extension === 'go') return 'go'
  if (['c', 'h', 'm'].includes(extension)) return 'c'
  if (['cc', 'cpp', 'cxx', 'hh', 'hpp', 'hxx', 'mm'].includes(extension)) return 'cpp'
  if (extension === 'cs') return 'csharp'
  if (extension === 'swift') return 'swift'
  if (['kt', 'kts'].includes(extension)) return 'kotlin'
  if (['java', 'class'].includes(extension)) return 'java'
  if (extension === 'rb') return 'ruby'
  if (extension === 'php') return 'php'
  if (['html', 'htm'].includes(extension)) return 'html'
  if (['css', 'less'].includes(extension)) return 'css'
  if (['scss', 'sass'].includes(extension)) return 'sass'
  if (['json', 'jsonc', 'jsonl'].includes(extension)) return 'json'
  if (['yaml', 'yml'].includes(extension)) return 'yaml'
  if (['toml', 'ini', 'cfg', 'conf', 'config'].includes(extension)) return 'settings'
  if (['xml', 'xsl', 'plist'].includes(extension)) return 'xml'
  if (['md', 'mdx', 'markdown'].includes(extension)) return 'markdown'
  if (['sh', 'bash', 'zsh', 'fish'].includes(extension)) return 'console'
  if (['ps1', 'psm1'].includes(extension)) return 'powershell'
  if (['sql', 'db', 'sqlite', 'sqlite3', 'csv', 'xls', 'xlsx'].includes(extension)) return 'database'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'ico', 'tiff'].includes(extension)) return 'image'
  if (extension === 'svg') return 'svg'
  if (extension === 'pdf') return 'pdf'
  if (['mp3', 'wav', 'flac', 'ogg', 'm4a'].includes(extension)) return 'audio'
  if (['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(extension)) return 'video'
  if (['zip', 'gz', 'tgz', 'bz2', 'xz', '7z', 'rar', 'tar', 'jar'].includes(extension)) return 'zip'
  if (['wasm', 'wat'].includes(extension)) return 'webassembly'
  if (['svelte', 'vue', 'lua', 'dart', 'astro', 'prisma', 'xaml', 'zig', 'nix', 'proto'].includes(extension)) return extension as FileTypeIconName
  if (['tf', 'tfvars'].includes(extension)) return 'terraform'
  if (['graphql', 'gql'].includes(extension)) return 'graphql'
  if (['coffee', 'cson'].includes(extension)) return 'coffee'
  if (extension === 'cr') return 'crystal'
  if (['ex', 'exs'].includes(extension)) return 'elixir'
  if (extension === 'elm') return 'elm'
  if (['erl', 'hrl'].includes(extension)) return 'erlang'
  if (['clj', 'cljs', 'cljc', 'edn'].includes(extension)) return 'clojure'
  if (['hs', 'lhs'].includes(extension)) return 'haskell'
  if (['hx', 'hxml'].includes(extension)) return 'haxe'
  if (['jinja', 'jinja2', 'j2'].includes(extension)) return 'jinja'
  if (extension === 'jl') return 'julia'
  if (['ml', 'mli'].includes(extension)) return 'ocaml'
  if (['pl', 'pm'].includes(extension)) return 'perl'
  if (['pug', 'jade'].includes(extension)) return 'pug'
  if (['scala', 'sbt', 'sc'].includes(extension)) return 'scala'
  if (extension === 'sol') return 'solidity'
  if (['tex', 'sty', 'cls'].includes(extension)) return 'tex'
  if (['diff', 'patch'].includes(extension)) return 'diff'
  if (['exe', 'dll', 'so', 'dylib'].includes(extension)) return 'exe'
  if (extension === 'lock') return 'lock'
  return 'file'
}

const PROVIDER_ICONS: Record<ProviderKind, string> = {
  amp: 'i-launcher-provider-amp',
  claude: 'i-launcher-provider-claude',
  codex: 'i-launcher-provider-openai',
  cursor: 'i-launcher-provider-cursor',
  deepSeek: 'i-launcher-provider-deepseek',
  fx: 'i-launcher-provider-fx',
  openCode: 'i-launcher-provider-opencode',
  grok: 'i-launcher-provider-grok',
  kimi: 'i-launcher-provider-kimi',
  ohMyPi: 'i-launcher-provider-ohmypi',
  pi: 'i-launcher-provider-pi',
}

export const PROVIDERS: Array<{
  id: ProviderKind
  name: string
  shortName: string
  command: string
}> = [
  { id: 'amp', name: 'Amp', shortName: 'Amp', command: 'amp' },
  { id: 'claude', name: 'Claude Code', shortName: 'Claude', command: 'claude' },
  { id: 'codex', name: 'Codex CLI', shortName: 'Codex', command: 'codex' },
  { id: 'cursor', name: 'Cursor CLI', shortName: 'Cursor', command: 'cursor-agent' },
  { id: 'deepSeek', name: 'DeepSeek Harness', shortName: 'DeepSeek', command: 'dsh' },
  { id: 'fx', name: 'Fx', shortName: 'Fx', command: 'fx' },
  { id: 'openCode', name: 'OpenCode', shortName: 'OpenCode', command: 'opencode' },
  { id: 'grok', name: 'Grok Build', shortName: 'Grok', command: 'grok' },
  { id: 'kimi', name: 'Kimi Code', shortName: 'Kimi', command: 'kimi' },
  { id: 'ohMyPi', name: 'Oh My Pi', shortName: 'Oh My Pi', command: 'omp' },
  { id: 'pi', name: 'Pi', shortName: 'Pi', command: 'pi' },
]

export function providerMeta(provider: ProviderKind) {
  return PROVIDERS.find((candidate) => candidate.id === provider) ?? PROVIDERS[2]!
}

export function ProviderIcon({
  provider,
  className,
  label,
}: {
  provider: ProviderKind
  className?: string
  label?: string
}) {
  return (
    <span
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={`inline-grid size-4 shrink-0 place-items-center ${providerColor(provider)} ${className ?? ''}`}
      role={label ? 'img' : undefined}
    >
      <span
        aria-hidden="true"
        className={PROVIDER_ICONS[provider]}
        style={{ width: '100%', height: '100%' }}
      />
    </span>
  )
}

function providerColor(provider: ProviderKind) {
  if (provider === 'amp') return 'text-[#f34e3f]'
  if (provider === 'claude') return 'text-[#d97757]'
  if (provider === 'deepSeek') return 'text-[#4d6bfe]'
  return 'text-[#34363b] dark:text-[#f3f3f3]'
}
