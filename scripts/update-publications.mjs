#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PUBLICATIONS_FILE = join(__dirname, '../src/pages/publications.astro');

const JOURNAL_ABBREVS = {
  'Physical Review E': 'Phys. Rev. E',
  'Physical Review Letters': 'Phys. Rev. Lett.',
  'Physical Review B': 'Phys. Rev. B',
  'The Journal of Chemical Physics': 'J. Chem. Phys.',
  'Journal of Chemical Physics': 'J. Chem. Phys.',
  'Soft Matter': 'Soft Matter',
  'New Journal of Physics': 'New J. Phys.',
  'Journal of Statistical Mechanics: Theory and Experiment': 'J. Stat. Mech.',
  'Polymers': 'Polymers',
  'EPL (Europhysics Letters)': 'EPL',
  'Physical Biology': 'Phys. Biol.',
  'Advances in Colloid and Interface Science': 'Adv. Colloid Interface Sci.',
};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'SMTLab-Publications-Bot/1.0 (mailto:pben@knu.ac.kr)' },
    }, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse error: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

async function fetchBenatosPapers() {
  const url =
    'https://api.crossref.org/works?query.author=panayotis+benetatos' +
    '&rows=40&sort=published&order=desc' +
    '&select=DOI,title,author,published,container-title,type';
  const data = await fetchJson(url);
  return data.message.items.filter(
    item =>
      item.type === 'journal-article' &&
      item.author?.some(a => a.family?.toLowerCase() === 'benetatos')
  );
}

function extractExistingDOIs(content) {
  const dois = new Set();
  for (const match of content.matchAll(/https:\/\/doi\.org\/([^\s'"]+)/g)) {
    dois.add(match[1].toLowerCase());
  }
  return dois;
}

function formatAuthors(authors) {
  return authors
    .map(a => {
      if (!a.family) return '';
      const initials = a.given
        ? a.given.split(/[\s-]+/).map(n => n[0] + '.').join(' ')
        : '';
      return initials ? `${initials} ${a.family}` : a.family;
    })
    .filter(Boolean)
    .join(', ');
}

function formatVenue(item, year) {
  const journal = item['container-title']?.[0] ?? 'Unknown Journal';
  const abbrev = JOURNAL_ABBREVS[journal] ?? journal;
  return `${abbrev} ${year}`;
}

function buildPaperEntry(item) {
  const year = item.published?.['date-parts']?.[0]?.[0];
  if (!year) return null;
  const doi = item.DOI.toLowerCase();
  const title = (item.title?.[0] ?? 'Unknown Title').replace(/'/g, "\\'");
  const authors = formatAuthors(item.author ?? []);
  const venue = formatVenue(item, year);
  return { year, doi, title, authors, venue };
}

function insertPaper(content, { year, doi, title, authors, venue }) {
  const block = `\
      {
        title: '${title}',
        authors: '${authors}',
        venue: '${venue}',
        type: 'Journal',
        links: { paper: 'https://doi.org/${doi}' },
      },`;

  // Insert into existing year group if present
  const yearGroupRe = new RegExp(
    `(\\{[\\s\\n]*year: ${year},[\\s\\S]*?papers: \\[)(\\n)`,
  );
  if (yearGroupRe.test(content)) {
    return content.replace(yearGroupRe, `$1$2${block}\n`);
  }

  // Find insertion point between year groups (sorted descending)
  const groupStarts = [...content.matchAll(/\n  \{\n    year: (\d{4}),/g)].map(m => ({
    index: m.index,
    year: parseInt(m[1]),
  }));

  const insertBefore = groupStarts.find(g => g.year < year);
  const newGroup = `\n  {\n    year: ${year},\n    papers: [\n${block}\n    ],\n  },`;

  if (insertBefore) {
    return content.slice(0, insertBefore.index) + newGroup + content.slice(insertBefore.index);
  }

  // Fallback: insert before closing of publications array
  return content.replace(/(\];\s*\nconst years)/, `${newGroup}\n];\nconst years`);
}

function updateYearsFilter(content, year) {
  if (year <= 2020) return content; // covered by '2020 -'
  const yearStr = `'${year}'`;
  if (content.includes(yearStr)) return content;

  return content.replace(
    /(const years = \[)([^\]]+)(\];)/,
    (_, open, inner, close) => {
      const parts = inner.split(',').map(s => s.trim());
      const idx = parts.findIndex(p => {
        const n = parseInt(p.replace(/'/g, ''));
        return !isNaN(n) && n < year;
      });
      if (idx === -1) parts.push(yearStr);
      else parts.splice(idx, 0, yearStr);
      return `${open}${parts.join(', ')}${close}`;
    }
  );
}

async function main() {
  console.log('Querying CrossRef for papers by Benetatos...');
  const items = await fetchBenatosPapers();
  console.log(`CrossRef returned ${items.length} journal articles.`);

  let content = readFileSync(PUBLICATIONS_FILE, 'utf-8');
  const existing = extractExistingDOIs(content);

  const newPapers = items
    .map(buildPaperEntry)
    .filter(p => p && !existing.has(p.doi));

  if (newPapers.length === 0) {
    console.log('No new papers found.');
    return;
  }

  // Process newest first so index offsets don't stack
  newPapers.sort((a, b) => b.year - a.year);

  for (const paper of newPapers) {
    console.log(`  + ${paper.year}: ${paper.title}`);
    content = insertPaper(content, paper);
    content = updateYearsFilter(content, paper.year);
  }

  writeFileSync(PUBLICATIONS_FILE, content, 'utf-8');
  console.log(`Done. Added ${newPapers.length} paper(s).`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
