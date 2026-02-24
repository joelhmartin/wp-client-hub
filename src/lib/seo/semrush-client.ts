import type { SEMrushKeyword } from './types';

interface SEMrushResult {
  keywords: SEMrushKeyword[];
  organicTraffic: number | null;
}

export async function fetchSEMrushKeywords(apiKey: string, domain: string): Promise<SEMrushResult> {
  // SEMrush API v3 — domain organic search keywords
  const url = new URL('https://api.semrush.com/');
  url.searchParams.set('type', 'domain_organic');
  url.searchParams.set('key', apiKey);
  url.searchParams.set('display_limit', '100');
  url.searchParams.set('export_columns', 'Ph,Po,Nq,Cp,Ur,Tr');
  url.searchParams.set('domain', domain);
  url.searchParams.set('database', 'us');

  const response = await fetch(url.toString());

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`SEMrush API error (${response.status}): ${text.slice(0, 200)}`);
  }

  const text = await response.text();
  const lines = text.trim().split('\n');

  if (lines.length < 2) {
    // Might be an error response or empty data
    if (lines[0]?.startsWith('ERROR')) {
      throw new Error(`SEMrush API error: ${lines[0]}`);
    }
    return { keywords: [], organicTraffic: null };
  }

  // First line is header: Keyword;Position;Search Volume;CPC;Url;Traffic (%)
  const keywords: SEMrushKeyword[] = [];
  let totalTraffic = 0;

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(';');
    if (parts.length < 6) continue;

    const trafficPercent = parseFloat(parts[5]) || 0;
    totalTraffic += trafficPercent;

    keywords.push({
      keyword: parts[0],
      position: parseInt(parts[1], 10) || 0,
      search_volume: parseInt(parts[2], 10) || 0,
      cpc: parseFloat(parts[3]) || 0,
      url: parts[4],
      traffic_percent: trafficPercent,
    });
  }

  return {
    keywords,
    organicTraffic: Math.round(totalTraffic),
  };
}
