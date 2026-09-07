export interface ReleaseInfo {
  version: string;
  name: string;
  changelog: string;
  publishedAt: string;
  apkDownloadUrl: string | null;
  htmlUrl: string;
}

export const CURRENT_VERSION = 'v0.3.0';

export const updateService = {
  async checkForUpdates(): Promise<{ hasUpdate: boolean; release: ReleaseInfo | null }> {
    try {
      // Check releases from GitHub repository
      const response = await fetch('https://api.github.com/repos/maksimdzoban/Nullnotes-App/releases/latest', {
        headers: { Accept: 'application/vnd.github.v3+json' }
      });

      if (!response.ok) {
        // Fallback to checking the main repo if public doesn't have releases yet
        const fallbackRes = await fetch('https://api.github.com/repos/maksimdzoban/Nullnotes/releases/latest', {
          headers: { Accept: 'application/vnd.github.v3+json' }
        });
        if (!fallbackRes.ok) {
          return { hasUpdate: false, release: null };
        }
        return this.parseRelease(await fallbackRes.json());
      }

      const data = await response.json();
      return this.parseRelease(data);
    } catch (err) {
      console.warn('Update check failed:', err);
      return { hasUpdate: false, release: null };
    }
  },

  parseRelease(data: any): { hasUpdate: boolean; release: ReleaseInfo | null } {
    if (!data || !data.tag_name) {
      return { hasUpdate: false, release: null };
    }

    const latestTag = data.tag_name.trim();
    const cleanCurrent = CURRENT_VERSION.replace(/^v/, '');
    const cleanLatest = latestTag.replace(/^v/, '');

    const hasUpdate = this.compareVersions(cleanLatest, cleanCurrent) > 0;

    let apkUrl: string | null = null;
    if (Array.isArray(data.assets)) {
      const apkAsset = data.assets.find((a: any) => a.name && a.name.endsWith('.apk'));
      if (apkAsset) {
        apkUrl = apkAsset.browser_download_url;
      }
    }

    const release: ReleaseInfo = {
      version: latestTag,
      name: data.name || latestTag,
      changelog: data.body || 'Оновлення містить покращення стабільності та новий функціонал.',
      publishedAt: data.published_at || new Date().toISOString(),
      apkDownloadUrl: apkUrl,
      htmlUrl: data.html_url || 'https://github.com/maksimdzoban/Nullnotes-App/releases'
    };

    return { hasUpdate, release };
  },

  compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map((p) => parseInt(p, 10) || 0);
    const parts2 = v2.split('.').map((p) => parseInt(p, 10) || 0);
    const length = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < length; i++) {
      const num1 = parts1[i] || 0;
      const num2 = parts2[i] || 0;
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    return 0;
  },

  triggerDownload(release: ReleaseInfo) {
    const targetUrl = release.apkDownloadUrl || release.htmlUrl;
    if (typeof window !== 'undefined') {
      window.open(targetUrl, '_blank');
    }
  }
};