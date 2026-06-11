// Run with: node test_adzuna.js
const axios = require('axios');

const APP_ID  = 'e9dd4282';
const APP_KEY = 'b67d981660ac9b3c4a5a8253b6475737';

async function test(label, what, where) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`TEST: ${label}`);
  console.log(`  what="${what}"  where="${where}"`);
  try {
    const res = await axios.get(
      `https://api.adzuna.com/v1/api/jobs/in/search/1`,
      {
        params: {
          app_id: APP_ID,
          app_key: APP_KEY,
          what,
          where,
          results_per_page: 5,
          sort_by: 'date',
        },
        timeout: 20000,
      }
    );

    const total   = res.data?.count ?? 0;
    const results = res.data?.results ?? [];
    console.log(`  Total on Adzuna: ${total}`);
    console.log(`  Results in page: ${results.length}`);

    if (results.length > 0) {
      // Inspect date field on first 3 jobs
      results.slice(0, 3).forEach((job, i) => {
        const raw       = job.created;
        const parsed    = new Date(raw);
        const cutoff    = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const isActive  = parsed > cutoff;
        console.log(`\n  Job ${i + 1}:`);
        console.log(`    title   : ${job.title}`);
        console.log(`    company : ${job.company?.display_name}`);
        console.log(`    created (raw)   : ${raw}`);
        console.log(`    created (parsed): ${parsed}`);
        console.log(`    cutoff          : ${cutoff}`);
        console.log(`    isActive (< 30d): ${isActive}`);
      });

      // Count how many pass the 30-day filter
      const cutoff   = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const active   = results.filter(j => new Date(j.created) > cutoff);
      const invalid  = results.filter(j => isNaN(new Date(j.created).getTime()));
      console.log(`\n  Filter results (from ${results.length} jobs in page):`);
      console.log(`    Active   (<= 30 days): ${active.length}`);
      console.log(`    Invalid date         : ${invalid.length}`);
      console.log(`    Filtered out         : ${results.length - active.length}`);
    }
  } catch (err) {
    console.log(`  ERROR: ${err.response?.status} ${err.response?.statusText || err.message}`);
    if (err.response?.data) console.log(`  Body: ${JSON.stringify(err.response.data)}`);
  }
}

(async () => {
  // 1. Exact query the app sends + location
  await test('App query — Full Stack Dev, Bangalore', 'Full Stack Developer full stack developer javascript typescript python', 'bangalore');

  // 2. Simpler query + same location
  await test('Simple — Full Stack Developer, Bangalore', 'Full Stack Developer', 'bangalore');

  // 3. No location (whole India)
  await test('No location — Full Stack Developer', 'Full Stack Developer', '');

  // 4. Software Engineer, India
  await test('Software Engineer, india', 'software engineer', 'india');
})();
