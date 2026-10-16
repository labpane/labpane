import { lstat, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, parse, relative, resolve } from "node:path";

export async function exists(path) {
  try {
    return await lstat(path);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

// Check every component, including the project root, before following a path.
export async function assertNoSymlinks(path) {
  const absolute = resolve(path);
  let current = parse(absolute).root;
  for (const part of relative(current, absolute)
    .split(/[\\/]/)
    .filter(Boolean)) {
    current = join(current, part);
    const stat = await exists(current);
    if (stat?.isSymbolicLink())
      throw new Error(`Refusing to write through a symbolic link: ${current}`);
  }
}

export async function readOptional(path, encoding = "utf8") {
  const stat = await exists(path);
  if (!stat) return null;
  if (!stat.isFile() || stat.isSymbolicLink())
    throw new Error(`Expected a regular file: ${path}`);
  return readFile(path, encoding);
}

// Each change carries the exact previous contents it is allowed to replace.
// Complete preflight happens before the first directory or file is created.
export async function applyFiles(
  root,
  files,
  { dryRun = false, log = console.log } = {},
) {
  const changes = [];
  const conflicts = [];
  for (const [name, value] of Object.entries(files)) {
    const path = resolve(root, name);
    if (relative(root, path).startsWith("..") || path === resolve(root))
      throw new Error(`Invalid output path: ${name}`);
    await assertNoSymlinks(path);
    const { content, previous = null } =
      typeof value === "string" ? { content: value } : value;
    const before = await readOptional(
      path,
      Buffer.isBuffer(content) ? null : "utf8",
    );
    if (
      Buffer.isBuffer(content)
        ? content.equals(before ?? Buffer.alloc(0))
        : before === content
    )
      continue;
    if (before !== previous) conflicts.push(name);
    else changes.push({ path, name, content, before });
  }
  if (conflicts.length)
    throw new Error(
      `Existing files differ; nothing was written:\n  ${conflicts.join("\n  ")}\nUse an empty directory, or review and move these files first.`,
    );
  for (const change of changes) {
    log(
      `${dryRun ? "Would " : ""}${change.before === null ? "create" : "update"} ${change.name}`,
    );
  }
  if (!dryRun) {
    for (const { path, content, before } of changes) {
      await assertNoSymlinks(path);
      if ((await readOptional(path)) !== before)
        throw new Error(`File changed during setup: ${path}`);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, content, { flag: before === null ? "wx" : "w" });
    }
  }
  if (!changes.length) log("Already configured; no changes needed.");
  return changes.map(({ name }) => name);
}
