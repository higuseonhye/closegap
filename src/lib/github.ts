/** Parse owner/repo from common GitHub URL shapes. */
export function parseGithubRepo(input: string): {
  owner: string;
  repo: string;
  httpsUrl: string;
} | null {
  const s = input.trim();
  if (!s) return null;
  const m = s.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/|$|\?|#)/i);
  if (!m) return null;
  const owner = m[1];
  const repo = m[2].replace(/\.git$/i, "");
  if (!owner || !repo) return null;
  return {
    owner,
    repo,
    httpsUrl: `https://github.com/${owner}/${repo}`,
  };
}

export function vercelNewCloneUrl(repoHttpsUrl: string): string {
  const u = encodeURIComponent(repoHttpsUrl.endsWith(".git") ? repoHttpsUrl.slice(0, -4) : repoHttpsUrl);
  return `https://vercel.com/new/clone?repository-url=${u}`;
}

export function githubCommitsUrl(repoHttps: string, branch = "main"): string {
  const p = parseGithubRepo(repoHttps);
  if (!p) return repoHttps;
  return `${p.httpsUrl}/commits/${branch}`;
}
