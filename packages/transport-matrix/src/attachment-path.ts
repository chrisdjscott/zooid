import { existsSync, realpathSync } from 'node:fs'
import { posix, resolve, sep } from 'node:path'

function within(child: string, parent: string, sepChar: string): boolean {
  return child === parent || child.startsWith(parent.endsWith(sepChar) ? parent : parent + sepChar)
}

/**
 * Map a path as the agent sees it to a host path ([[ZOD068]]).
 *
 * Local agents (`hostDir === agentPath`): relative paths resolve against the
 * workdir, absolute paths are read as-is, no confinement.
 *
 * Container agents: the path must sit under `agentPath` (`/workspace`), and
 * the mapped host path's realpath must stay inside the workdir's realpath so
 * a planted symlink can't reach the host. Throws `Error(reason)` on refusal.
 */
export function resolveAttachmentPath(input: {
  path: string
  hostDir: string
  agentPath: string
}): string {
  const { path, hostDir, agentPath } = input
  if (hostDir === agentPath) return resolve(hostDir, path)

  const outside = () =>
    new Error(
      `${path} is outside ${agentPath}; a container agent can only attach files under ${agentPath}`,
    )
  const normalised = posix.normalize(posix.isAbsolute(path) ? path : posix.join(agentPath, path))
  if (!within(normalised, posix.normalize(agentPath), '/')) throw outside()

  const mapped = resolve(hostDir, posix.relative(agentPath, normalised))
  if (existsSync(mapped)) {
    if (!within(realpathSync(mapped), realpathSync(hostDir), sep)) throw outside()
  }
  return mapped
}
