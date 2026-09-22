import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';

const root = fileURLToPath(new URL('../', import.meta.url));

function filesUnder(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : entry.isFile() ? [path] : [];
  });
}

test('text size tokens always use typed Tailwind utilities', () => {
  const files = [
    ...filesUnder(join(root, 'src')).filter((path) => /\.(ts|tsx|css|mdx)$/.test(path)),
    ...filesUnder(join(root, 'content')).filter((path) => path.endsWith('.mdx')),
  ];
  const violations = files.flatMap((path) =>
    readFileSync(path, 'utf8').split('\n').flatMap((line, index) =>
      line.includes('text-[var(--text-') ? [`${relative(root, path)}:${index + 1}`] : [],
    ),
  );
  expect(violations, 'Untyped text size utilities').toEqual([]);
});

test('all referenced custom properties have central definitions', () => {
  const definitionFiles = [
    join(root, 'src/styles/tokens.css'),
    ...filesUnder(join(root, 'src/styles/themes')).filter((path) => path.endsWith('.css')),
    join(root, 'src/app/globals.css'),
  ];
  const defined = new Set(definitionFiles.flatMap((path) =>
    [...readFileSync(path, 'utf8').matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1]),
  ));
  const missing = filesUnder(join(root, 'src')).flatMap((path) => {
    const referenced = new Set(
      [...readFileSync(path, 'utf8').matchAll(/var\(\s*(--[\w-]+)\s*[,)]/g)].map((match) => match[1]),
    );
    return [...referenced].filter((name) => !defined.has(name))
      .map((name) => `${relative(root, path)}: ${name}`);
  });
  expect(missing, 'Custom properties missing central definitions').toEqual([]);
});
