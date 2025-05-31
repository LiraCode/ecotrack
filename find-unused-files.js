// Script para encontrar arquivos não importados e pastas vazias em src
// Uso: node find-unused-files.js

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const IGNORED_EXTENSIONS = ['.md', '.json', '.lock', '.ico'];
const NEXT_PAGE_FILES = [
  'page.js', 'page.jsx', 'layout.js', 'layout.jsx',
  'route.js', 'route.ts', 'route.jsx', 'route.tsx',
  'error.js', 'error.jsx', 'loading.js', 'loading.jsx',
  'not-found.js', 'not-found.jsx'
];
const INDEX_FILES = ['index.js', 'index.jsx', 'index.ts', 'index.tsx'];
const SUPPORTED_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

let allFiles = [];
let allDirs = [];
let emptyDirs = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let isEmpty = true;
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      allDirs.push(fullPath);
      if (walk(fullPath)) {
        emptyDirs.push(fullPath);
      } else {
        isEmpty = false;
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (!IGNORED_EXTENSIONS.includes(ext)) {
        allFiles.push(fullPath);
        isEmpty = false;
      }
    }
  }
  return isEmpty;
}

function getPossibleImportPaths(file) {
  // Caminho relativo ao SRC_DIR
  const relPath = path.relative(SRC_DIR, file).replace(/\\/g, '/');
  // Caminho absoluto com @
  const absPath = '@/'+relPath;
  // Sem extensão
  const relPathNoExt = relPath.replace(/\.[^.]+$/, '');
  const absPathNoExt = absPath.replace(/\.[^.]+$/, '');
  // Caminho de pasta (caso seja index.js/jsx/ts/tsx)
  let folderImport = null;
  if (INDEX_FILES.includes(path.basename(file))) {
    const folder = relPath.split('/').slice(0, -1).join('/');
    folderImport = folder;
  }
  // Caminho relativo para cada possível importador
  const possiblePaths = [relPath, absPath, relPathNoExt, absPathNoExt];
  if (folderImport) {
    possiblePaths.push(folderImport);
    possiblePaths.push('@/' + folderImport);
  }
  return possiblePaths;
}

function resolveRelativeImport(importPath, importerFile) {
  // Resolve o caminho real de um import relativo a partir do arquivo importador
  const importerDir = path.dirname(importerFile);
  let base = path.resolve(importerDir, importPath);
  // Tenta casar com todos os sufixos de extensão
  for (const ext of SUPPORTED_EXTENSIONS) {
    if (fs.existsSync(base + ext)) return base + ext;
  }
  // Tenta como pasta/index.ext
  for (const ext of SUPPORTED_EXTENSIONS) {
    if (fs.existsSync(path.join(base, 'index' + ext))) return path.join(base, 'index' + ext);
  }
  return null;
}

function fileIsImported(file, allFiles, fetchApiRoutes, usedPageFolders) {
  // 1. Ignorar arquivos de página do Next.js
  if (NEXT_PAGE_FILES.includes(path.basename(file))) {
    // Se for page/layout, marca a pasta como usada
    const base = path.basename(file);
    if (base.startsWith('page') || base.startsWith('layout')) {
      const folder = path.dirname(file);
      usedPageFolders.add(folder);
    }
    return true;
  }
  // 2. Se for um arquivo de rota de API e houver fetch para ele, considerar utilizado
  if (isApiRouteFile(file) && fetchApiRoutes.has(apiRoutePathFromFile(file))) {
    return true;
  }
  // 3. Import tradicional (melhorado)
  for (const f of allFiles) {
    if (f === file) continue;
    const content = fs.readFileSync(f, 'utf8');
    // Busca todos os imports/require
    const importRegex = /(?:import\s+.*?from\s+['"](.*?)['"]|require\(['"](.*?)['"]\))/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1] || match[2];
      if (!importPath) continue;
      // Import relativo
      if (importPath.startsWith('.')) {
        const resolved = resolveRelativeImport(importPath, f);
        if (resolved && path.resolve(resolved) === path.resolve(file)) {
          return true;
        }
      } else if (importPath.startsWith('@/')) {
        // Import absoluto
        let base = importPath.replace(/^@\//, '');
        base = base.replace(/\\/g, '/');
        // Tenta casar com todos os sufixos de extensão
        for (const ext of SUPPORTED_EXTENSIONS) {
          if (path.resolve(SRC_DIR, base + ext) === path.resolve(file)) return true;
        }
        // Tenta como pasta/index.ext
        for (const ext of SUPPORTED_EXTENSIONS) {
          if (path.resolve(SRC_DIR, base, 'index' + ext) === path.resolve(file)) return true;
        }
        // Tenta casar sem extensão (ex: import '@/services/adminService')
        const fileNoExt = file.replace(/\.[^.]+$/, '');
        if (path.resolve(SRC_DIR, base) === path.resolve(fileNoExt)) return true;
      }
    }
  }
  return false;
}

// Detecta se é um arquivo de rota de API do Next.js
function isApiRouteFile(file) {
  const rel = path.relative(SRC_DIR, file).replace(/\\/g, '/');
  return rel.startsWith('app/api/') && /route\.(js|ts|jsx|tsx)$/.test(rel);
}

// Gera o path da rota de API a partir do arquivo
function apiRoutePathFromFile(file) {
  const rel = path.relative(SRC_DIR, file).replace(/\\/g, '/');
  if (!rel.startsWith('app/api/')) return null;
  return '/' + rel.replace(/^app\//, '').replace(/\/route\.(js|ts|jsx|tsx)$/, '');
}

// Busca todos os fetchs para rotas internas
function findAllApiFetchRoutes() {
  const fetchRoutes = new Set();
  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const regex = /fetch\([`'\"](\/api\/[\w\-\/\[\]]+)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      fetchRoutes.add(match[1]);
    }
  }
  return fetchRoutes;
}

function main() {
  walk(SRC_DIR);
  const fetchApiRoutes = findAllApiFetchRoutes();
  const unusedFiles = [];
  const usedPageFolders = new Set();
  for (const file of allFiles) {
    // Ignorar arquivos index.js/jsx/ts/tsx (mas só se não for importado como pasta)
    if (/index\.(js|jsx|ts|tsx)$/.test(path.basename(file))) {
      // Só marca como não usado se não for importado como pasta
      let imported = false;
      for (const f of allFiles) {
        if (f === file) continue;
        const content = fs.readFileSync(f, 'utf8');
        const importRegex = /(?:import\s+.*?from\s+['"](.*?)['"]|require\(['"](.*?)['"]\))/g;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
          const importPath = match[1] || match[2];
          if (!importPath) continue;
          if (importPath.startsWith('.')) {
            const resolved = resolveRelativeImport(importPath, f);
            if (resolved && path.resolve(resolved) === path.resolve(file)) {
              imported = true;
              break;
            }
          } else if (importPath.startsWith('@/')) {
            let base = importPath.replace(/^@\//, '');
            base = base.replace(/\\/g, '/');
            for (const ext of SUPPORTED_EXTENSIONS) {
              if (path.resolve(SRC_DIR, base + ext) === path.resolve(file)) imported = true;
            }
            for (const ext of SUPPORTED_EXTENSIONS) {
              if (path.resolve(SRC_DIR, base, 'index' + ext) === path.resolve(file)) imported = true;
            }
          }
        }
        if (imported) break;
      }
      if (!imported) continue;
    }
    if (!fileIsImported(file, allFiles, fetchApiRoutes, usedPageFolders)) {
      unusedFiles.push(file);
    }
  }

  // Remover arquivos page/layout/etc de pastas que são usadas como rota
  const trulyUnusedFiles = unusedFiles.filter(f => {
    const base = path.basename(f);
    if (NEXT_PAGE_FILES.includes(base)) {
      const folder = path.dirname(f);
      if (usedPageFolders.has(folder)) return false;
    }
    return true;
  });

  console.log('--- Pastas vazias ---');
  if (emptyDirs.length === 0) {
    console.log('Nenhuma pasta vazia encontrada.');
  } else {
    emptyDirs.forEach(d => console.log(path.relative(SRC_DIR, d)));
  }

  console.log('\n--- Arquivos não importados ---');
  if (trulyUnusedFiles.length === 0) {
    console.log('Todos os arquivos são importados em algum lugar ou são páginas/rotas do Next.js.');
  } else {
    trulyUnusedFiles.forEach(f => console.log(path.relative(SRC_DIR, f)));
  }
}

main(); 