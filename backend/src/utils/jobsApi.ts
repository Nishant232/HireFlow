import axios from 'axios';

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: { min: number; max: number; currency: string };
  description: string;
  url: string;
  postedDate: string;
  jobType: string;
  isActive: boolean;
  daysOld: number;
}

// ─── Date parsing ─────────────────────────────────────────────────────────────
// Adzuna's Indian endpoint returns dates in several non-standard formats:
//   "2026Z"              → only year + Z   (invalid ISO 8601)
//   "2026-06Z"           → year-month + Z
//   "2026-06-01T00:00:00Z" → full ISO (ideal)
// We normalise all of them into a real Date.
function parseAdzunaDate(raw: string | undefined): Date {
  if (!raw) return new Date(); // treat missing as "now"

  // Already a valid full ISO string?
  const d = new Date(raw);
  if (!isNaN(d.getTime())) return d;

  // Try to fix "2026Z" → treat as first day of the year
  const yearOnly = raw.match(/^(\d{4})Z?$/);
  if (yearOnly) return new Date(`${yearOnly[1]}-01-01T00:00:00Z`);

  // Try "2026-06Z" → first day of that month
  const yearMonth = raw.match(/^(\d{4}-\d{2})Z?$/);
  if (yearMonth) return new Date(`${yearMonth[1]}-01T00:00:00Z`);

  // Unknown format — default to now so the job isn't filtered out
  console.warn(`⚠️  Unknown Adzuna date format: "${raw}" — defaulting to now`);
  return new Date();
}

// ─── Single Adzuna request ────────────────────────────────────────────────────
async function fetchFromAdzuna(params: {
  primaryKeyword: string;    // used as `what` — single phrase, best precision
  extraKeywords:  string[];  // used as `what_or` — OR matching for extras
  location: string;
  country:  string;
  maxResults: number;
}): Promise<any[]> {
  const { primaryKeyword, extraKeywords, location, country, maxResults } = params;

  const reqParams: Record<string, any> = {
    app_id:           process.env.ADZUNA_APP_ID,
    app_key:          process.env.ADZUNA_APP_KEY,
    what:             primaryKeyword,          // exact phrase / AND words
    results_per_page: maxResults,
    sort_by:          'date',
    'content-type':   'application/json',
  };

  // OR-match additional keywords to widen results
  if (extraKeywords.length > 0) {
    reqParams.what_or = extraKeywords.join(' ');
  }

  // Skip `where` for country-wide searches — Adzuna India's city-level
  // geo-index is sparse and almost always returns 0 when a city is specified.
  // Users wanting city-specific results should use a more specific title instead.
  const skipLocation =
    !location ||
    location.toLowerCase() === 'india' ||
    location.trim() === '';

  if (!skipLocation) {
    // Pass location only for non-India searches; typos/unknown cities → 0 results
    // so we add a fallback: if location looks like an Indian city, skip it
    // (Adzuna India = entire country endpoint, city filtering rarely works)
    console.log(`   Note: Adzuna India endpoint — ignoring city "${location}" (country-wide search gives best results)`);
  }

  const response = await axios.get(
    `https://api.adzuna.com/v1/api/jobs/${country}/search/1`,
    { params: reqParams, timeout: 20000 }
  );

  console.log(`   Adzuna raw count: ${response.data?.count ?? 0}, page results: ${response.data?.results?.length ?? 0}`);
  return response.data?.results || [];
}

// ─── Main search function ─────────────────────────────────────────────────────
// Always returns { jobs, error? } — never throws.
export async function searchJobs(params: {
  keywords: string[];
  location?: string;
  country?: string;
  maxResults?: number;
  maxDaysOld?: number;
}): Promise<{ jobs: JobListing[]; error?: string }> {
  const {
    keywords,
    location   = 'india',
    country    = process.env.ADZUNA_COUNTRY || 'in',
    maxResults = 15,
    maxDaysOld = 60,   // widened from 30 → 60 days to catch more results
  } = params;

  // Guard: credentials missing
  const appId  = (process.env.ADZUNA_APP_ID  || '').trim();
  const appKey = (process.env.ADZUNA_APP_KEY || '').trim();

  if (!appId || !appKey) {
    console.warn('⚠️  Adzuna credentials missing from environment');
    return {
      jobs: [],
      error: 'Adzuna API credentials not configured. Add ADZUNA_APP_ID and ADZUNA_APP_KEY to backend/.env',
    };
  }

  // Primary keyword = job title (first item). Adzuna `what` uses AND logic,
  // so sending multiple words together returns 0 when all must match.
  // Extra keywords go into `what_or` for broader OR-matching.
  const primaryKeyword = keywords[0] || 'software engineer';
  const extraKeywords  = keywords.slice(1, 5);  // up to 4 additional terms via OR
  const cutoffDate     = new Date(Date.now() - maxDaysOld * 24 * 60 * 60 * 1000);

  console.log(`🔎 Adzuna: what="${primaryKeyword}" what_or="${extraKeywords.join(' ')}" country="${country}"`);

  // Fetch with one automatic retry on timeout
  let rawJobs:  any[] = [];
  let lastError        = '';

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      rawJobs   = await fetchFromAdzuna({ primaryKeyword, extraKeywords, location, country, maxResults });
      lastError = '';
      break;
    } catch (err: any) {
      lastError       = err.message || 'Unknown error';
      const isTimeout = err.code === 'ECONNABORTED' || lastError.includes('timeout');
      const isAuth    = [401, 403].includes(err.response?.status);

      console.warn(`⚠️  Adzuna attempt ${attempt} [${err.response?.status || err.code}]: ${lastError}`);

      if (isAuth) {
        return { jobs: [], error: 'Adzuna API authentication failed. Check ADZUNA_APP_ID and ADZUNA_APP_KEY.' };
      }
      if (attempt === 1 && isTimeout) {
        console.log('   Retrying after 2 s...');
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      break;
    }
  }

  if (lastError) {
    const isTimeout = lastError.includes('timeout');
    const msg       = isTimeout
      ? 'Adzuna API timed out. The service may be slow — please try again in a moment.'
      : `Adzuna API error: ${lastError}`;
    console.error('❌ Adzuna failed:', lastError);
    return { jobs: [], error: msg };
  }

  if (rawJobs.length === 0) {
    console.log('   Adzuna returned 0 raw results for this query');
    return { jobs: [] };
  }

  // Transform + filter
  const jobs: JobListing[] = rawJobs
    .map((job: any) => {
      const postedDate = parseAdzunaDate(job.created);
      const daysOld    = Math.max(0, Math.floor(
        (Date.now() - postedDate.getTime()) / (1000 * 60 * 60 * 24)
      ));

      return {
        id:          String(job.id),
        title:       job.title       || 'Untitled',
        company:     job.company?.display_name || 'Unknown Company',
        location:    job.location?.display_name || location,
        salary:      job.salary_min
          ? { min: Math.round(job.salary_min), max: Math.round(job.salary_max || job.salary_min), currency: 'INR' }
          : undefined,
        description: (job.description?.substring(0, 300) || '') + '...',
        url:         job.redirect_url || '#',
        postedDate:  postedDate.toISOString(),
        jobType:     job.contract_time || 'full_time',
        isActive:    daysOld <= maxDaysOld,
        daysOld,
      };
    })
    .filter((job: JobListing) => job.isActive);

  console.log(`✅ After filter: ${jobs.length} active jobs (≤${maxDaysOld}d) from ${rawJobs.length} raw results`);
  return { jobs };
}

// ─── Keyword extractor ────────────────────────────────────────────────────────
export function extractKeywordsFromResume(resumeText: string): string[] {
  const techKeywords = [
    'javascript', 'typescript', 'python', 'java', 'react', 'node', 'nodejs',
    'express', 'next.js', 'nextjs', 'vue', 'angular', 'mongodb', 'postgresql',
    'mysql', 'redis', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'git',
    'rest', 'api', 'graphql', 'microservices', 'machine learning', 'deep learning',
    'tensorflow', 'pytorch', 'sql', 'nosql', 'linux', 'ci/cd', 'devops',
    'flutter', 'react native', 'django', 'flask', 'spring', 'tailwind',
    'full stack', 'frontend', 'backend', 'software engineer', 'developer',
    'ai', 'ml engineer', 'data science', 'computer vision', 'nlp',
  ];

  const text       = resumeText.toLowerCase();
  const found      = techKeywords.filter((kw) => text.includes(kw));
  const roleTitles = [
    'software engineer', 'full stack developer', 'frontend developer',
    'backend developer', 'data scientist', 'ml engineer', 'devops engineer',
    'ai engineer', 'mobile developer',
  ];
  const foundRoles = roleTitles.filter((r) => text.includes(r));

  return [...new Set([...foundRoles, ...found])].slice(0, 6);
}
