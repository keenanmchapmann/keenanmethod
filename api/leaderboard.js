// Secure server-side proxy. The Airtable token lives ONLY here, as an
// environment variable on Vercel (AIRTABLE_TOKEN). The browser never sees it.
// The page only ever receives display names + points — no emails, no private fields.

export default async function handler(req, res) {
  const token = process.env.AIRTABLE_TOKEN;
  const BASE = 'appWHTfgnY8sL7FiM';
  const TABLE = 'tblUPReVzjT9rfTs8'; // clients

  if (!token) {
    res.status(500).json({ error: 'Missing AIRTABLE_TOKEN' });
    return;
  }

  try {
    let records = [];
    let offset;

    // Airtable returns max 100 rows per page; loop until all active clients are in.
    do {
      const url = new URL(`https://api.airtable.com/v0/${BASE}/${TABLE}`);
      url.searchParams.set('filterByFormula', "{Status}='Active'");
      url.searchParams.append('fields[]', 'Display Name');
      url.searchParams.append('fields[]', "This Month's Points");
      url.searchParams.append('fields[]', "This Week's Points");
      url.searchParams.append('fields[]', 'Total Points');
      url.searchParams.set('pageSize', '100');
      if (offset) url.searchParams.set('offset', offset);

      const r = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!r.ok) {
        res.status(502).json({ error: 'Airtable request failed', status: r.status });
        return;
      }

      const data = await r.json();
      records = records.concat(data.records || []);
      offset = data.offset;
    } while (offset);

    const players = records
      .map((rec) => ({
        name: rec.fields['Display Name'] || '',
        month: rec.fields["This Month's Points"] || 0,
        week: rec.fields["This Week's Points"] || 0,
        total: rec.fields['Total Points'] || 0,
      }))
      .filter((p) => p.name);

    // Cache at the edge for 60s so 121 reads don't hammer Airtable on every visit.
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    res.status(200).json({ players });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
}
