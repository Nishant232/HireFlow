import axios from 'axios';

export type UrlStatus = 'valid' | 'broken' | 'redirect' | 'timeout' | 'unknown';

export interface VerifiedUrl {
  url: string;
  status: UrlStatus;
  statusCode: number | null;
  responseTime: number;
  suggestion: string | null;
  platform: string | null;
}

// Detect platform from URL
function detectPlatform(url: string): string | null {
  if (url.includes('linkedin.com')) return 'LinkedIn';
  if (url.includes('github.com')) return 'GitHub';
  if (url.includes('portfolio') || url.includes('vercel.app') || url.includes('netlify.app')) return 'Portfolio';
  if (url.includes('leetcode.com')) return 'LeetCode';
  if (url.includes('hackerrank.com')) return 'HackerRank';
  if (url.includes('medium.com')) return 'Medium';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter/X';
  return 'Website';
}

// Generate human-readable suggestion for broken URLs
function generateSuggestion(url: string, statusCode: number | null): string | null {
  if (!statusCode || statusCode === 200) return null;

  const platform = detectPlatform(url);

  if (statusCode === 404) {
    if (platform === 'GitHub') return 'Repository or profile not found. Check if repo is public or username is correct.';
    if (platform === 'LinkedIn') return 'Profile not found. Verify your LinkedIn custom URL in profile settings.';
    return 'Page not found (404). The URL may be outdated or mistyped.';
  }

  if (statusCode === 403) {
    if (platform === 'LinkedIn') return 'LinkedIn restricts automated checks. Manually verify this URL is correct.';
    return 'Access forbidden (403). The page may require login.';
  }

  if (statusCode >= 500) return 'Server error. The website may be temporarily down.';

  return `Returned status ${statusCode}. Please verify this URL is correct.`;
}

// Verify a single URL
export async function verifyUrl(url: string): Promise<VerifiedUrl> {
  const start = Date.now();
  const platform = detectPlatform(url);

  // LinkedIn blocks automated HEAD/GET — mark as unverifiable
  if (url.includes('linkedin.com')) {
    return {
      url,
      status: 'unknown',
      statusCode: null,
      responseTime: 0,
      suggestion: 'LinkedIn blocks automated verification. Please verify this URL manually.',
      platform: 'LinkedIn',
    };
  }

  try {
    const response = await axios.head(url, {
      timeout: 6000,
      maxRedirects: 3,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ResumeChecker/1.0)',
      },
      validateStatus: () => true, // Don't throw on any status
    });

    const responseTime = Date.now() - start;
    const statusCode = response.status;

    let status: UrlStatus;
    if (statusCode >= 200 && statusCode < 300) {
      status = 'valid';
    } else if (statusCode >= 300 && statusCode < 400) {
      status = 'redirect';
    } else {
      status = 'broken';
    }

    return {
      url,
      status,
      statusCode,
      responseTime,
      suggestion: generateSuggestion(url, statusCode),
      platform,
    };
  } catch (err: any) {
    const responseTime = Date.now() - start;

    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      return {
        url,
        status: 'timeout',
        statusCode: null,
        responseTime,
        suggestion: 'Request timed out. The website may be slow or down.',
        platform,
      };
    }

    return {
      url,
      status: 'broken',
      statusCode: null,
      responseTime,
      suggestion: 'Could not reach this URL. Check if it is correct and accessible.',
      platform,
    };
  }
}

// Verify all URLs concurrently (with concurrency limit)
export async function verifyAllUrls(
  urls: string[],
  concurrencyLimit = 4
): Promise<VerifiedUrl[]> {
  const results: VerifiedUrl[] = [];

  // Process in batches to avoid overwhelming servers
  for (let i = 0; i < urls.length; i += concurrencyLimit) {
    const batch = urls.slice(i, i + concurrencyLimit);
    const batchResults = await Promise.all(batch.map(verifyUrl));
    results.push(...batchResults);
  }

  return results;
}

// Summary stats for verified URLs
export function getVerificationSummary(results: VerifiedUrl[]) {
  return {
    total: results.length,
    valid: results.filter((r) => r.status === 'valid').length,
    broken: results.filter((r) => r.status === 'broken').length,
    unknown: results.filter((r) => r.status === 'unknown').length,
    timeout: results.filter((r) => r.status === 'timeout').length,
    redirect: results.filter((r) => r.status === 'redirect').length,
  };
}
