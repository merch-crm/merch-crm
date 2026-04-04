#!/usr/bin/env npx tsx
/**
 * Анализ потребления памяти в development режиме
 * Запуск: npx tsx scripts/analyze-memory.ts
 */

import { execSync } from "child_process";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

console.log("\n📊 АНАЛИЗ ПАМЯТИ MERCH-CRM\n");
console.log("=".repeat(50));

// 1. Анализ размера node_modules
console.log("\n📦 Топ-20 самых тяжёлых зависимостей:\n");

interface PackageSize {
  name: string;
  size: number;
}

function getDirSize(dirPath: string): number {
  let size = 0;
  try {
    const files = readdirSync(dirPath);
    for (const file of files) {
      const filePath = join(dirPath, file);
      const stat = statSync(filePath);
      if (stat.isDirectory()) {
        size += getDirSize(filePath);
      } else {
        size += stat.size;
      }
    }
  } catch {
    // Игнорируем ошибки доступа
  }
  return size;
}

function formatSize(bytes: number): string {
  if (bytes > 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
}

const nodeModulesPath = join(process.cwd(), "node_modules");
const packages: PackageSize[] = [];

try {
  const dirs = readdirSync(nodeModulesPath);
  
  for (const dir of dirs) {
    if (dir.startsWith(".")) continue;
    
    const fullPath = join(nodeModulesPath, dir);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (dir.startsWith("@")) {
        // Scoped packages
        const scopedDirs = readdirSync(fullPath);
        for (const scopedDir of scopedDirs) {
          const scopedPath = join(fullPath, scopedDir);
          packages.push({
            name: `${dir}/${scopedDir}`,
            size: getDirSize(scopedPath),
          });
        }
      } else {
        packages.push({
          name: dir,
          size: getDirSize(fullPath),
        });
      }
    }
  }
} catch (error) {
  console.error("Ошибка чтения node_modules:", error);
}

packages
  .sort((a, b) => b.size - a.size)
  .slice(0, 20)
  .forEach((pkg, i) => {
    console.log(`${String(i + 1).padStart(2)}. ${pkg.name.padEnd(40)} ${formatSize(pkg.size)}`);
  });

// 2. Анализ package.json
console.log("\n📋 Статистика зависимостей:\n");

const packageJson = JSON.parse(readFileSync("package.json", "utf-8"));
const deps = Object.keys(packageJson.dependencies || {}).length;
const devDeps = Object.keys(packageJson.devDependencies || {}).length;

console.log(`   Dependencies:     ${deps}`);
console.log(`   DevDependencies:  ${devDeps}`);
console.log(`   Всего:            ${deps + devDeps}`);

// 3. Проверка дублирующихся зависимостей
console.log("\n🔍 Поиск дублирующихся зависимостей...\n");

try {
  const output = execSync("npm ls --all --json 2>/dev/null", { encoding: "utf-8" });
  const tree = JSON.parse(output);
  
  const versions = new Map<string, Set<string>>();
  
  function traverse(deps: Record<string, unknown>, prefix = "") {
    for (const [name, info] of Object.entries(deps)) {
      if (typeof info === "object" && info !== null) {
        const version = (info as { version?: string }).version;
        if (version) {
          if (!versions.has(name)) {
            versions.set(name, new Set());
          }
          versions.get(name)!.add(version);
        }
        
        const nested = (info as { dependencies?: Record<string, unknown> }).dependencies;
        if (nested) {
          traverse(nested, `${prefix}${name}/`);
        }
      }
    }
  }
  
  if (tree.dependencies) {
    traverse(tree.dependencies);
  }
  
  const duplicates = Array.from(versions.entries())
    .filter(([_, v]) => v.size > 1)
    .sort((a, b) => b[1].size - a[1].size);
  
  if (duplicates.length > 0) {
    console.log("   Пакеты с несколькими версиями:");
    duplicates.slice(0, 10).forEach(([name, vers]) => {
      console.log(`   - ${name}: ${Array.from(vers).join(", ")}`);
    });
  } else {
    console.log("   ✅ Дублирующихся зависимостей не найдено");
  }
} catch {
  console.log("   ⚠️  Не удалось проанализировать дерево зависимостей");
}

// 4. Рекомендации
console.log("\n💡 РЕКОМЕНДАЦИИ:\n");
console.log("=".repeat(50));

const heavyPackages = ["fabric", "sharp", "mongodb", "jspdf", "recharts", "framer-motion"];
const foundHeavy = packages
  .filter((p) => heavyPackages.some((h) => p.name.includes(h)))
  .map((p) => p.name);

if (foundHeavy.length > 0) {
  console.log("\n1. Тяжёлые пакеты (рассмотрите lazy loading):");
  foundHeavy.forEach((p) => console.log(`   - ${p}`));
}

console.log("\n2. Общие рекомендации:");
console.log("   - Используйте dynamic import для тяжёлых компонентов");
console.log("   - Проверьте barrel exports (index.ts файлы)");
console.log("   - Включите Turbopack для быстрой компиляции");
console.log("   - Используйте --turbo флаг в dev режиме");

console.log("\n" + "=".repeat(50) + "\n");
