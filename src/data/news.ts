export interface NewsItem {
  date: string;
  category: string;
  title: string;
  body: string;
  tag: string;
  coauthors?: { name: string; url: string }[];
  link?: string;
  linkText?: string;
}

const monthIndex: Record<string, number> = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
};

export const news: NewsItem[] = [
  {
    date: 'March 2026',
    category: 'Publication',
    title: '"Cross-linked pair of polymer chains under strong tension" Published',
    body: 'Published in Physical Review E. By Geunho Noh and Prof. Benetatos. The paper studies the mechanical response of a cross-linked polymer chain pair under applied tension.',
    tag: 'Publication',
  },
  {
    date: 'September 2025',
    category: 'Publication',
    title: '"Thermodynamics and Statistical Physics" 5th Edition Published',
    body: 'The 5th Edition, Revised and Expanded of "Thermodynamics and Statistical Physics" (in Greek) has been published.',
    tag: 'Publication',
    coauthors: [
      { name: 'Ioannis D. Vergados', url: 'https://physics.uoi.gr/en/prosopiko/vergados-ioannis/' },
      { name: 'Ioannis N. Remediakis', url: 'https://www.materials.uoc.gr/en/faculty/ioannis-remediakis/' },
      { name: 'Elias Triantafyllopoulos', url: '' },
    ],
    link: 'https://www.ekdoseis-symeon.gr/%CE%B5%CF%80%CE%B9%CF%83%CF%84%CE%B7%CE%BC%CE%BF%CE%BD%CE%B9%CE%BA%CE%B1-%CF%83%CF%85%CE%B3%CE%B3%CF%81%CE%B1%CE%BC%CE%BC%CE%B1%CF%84%CE%B1/%CE%B8%CE%B5%CF%84%CE%B9%CE%BA%CE%B5%CF%83-%CE%B5%CF%80%CE%B9%CF%83%CF%84%CE%B7%CE%BC%CE%B5%CF%83/%CF%86%CF%85%CF%83%CE%B9%CE%BA%CE%B7-%CF%87%CE%B7%CE%BC%CE%B5%CE%B9%CE%B1/%CE%B8%CE%B5%CF%81%CE%BC%CE%BF%CE%B4%CF%85%CE%BD%CE%B1%CE%BC%CE%B9%CE%BA%CE%B7-%CE%BA%CE%B1%CE%B9-%CF%83%CF%84%CE%B1%CF%84%CE%B9%CF%83%CF%84%CE%B9%CE%BA%CE%B7-%CF%86%CF%85%CF%83%CE%B9%CE%BA%CE%B7.html?tag=%CE%95%CE%A0%CE%99%CE%A3%CE%A4%CE%97%CE%9C%CE%9F%CE%9D%CE%99%CE%9A%CE%91&sort=pd.name&order=DESC&page=4',
    linkText: 'Θερμοδυναμική και Στατιστική Φυσική',
  },
  {
    date: 'July 2025',
    category: 'Publication',
    title: '"Elasticity of a freely jointed chain with quenched disorder" Published',
    body: 'Published in Journal of Statistical Mechanics: Theory and Experiment. By Minsu Yi and Prof. Benetatos. The paper examines how quenched disorder on fluctuating bending stiffness affects the elastic response in the framework of a freely jointed chain.',
    tag: 'Publication',
  },
  {
    date: 'December 2024',
    category: 'Publication',
    title: '"Bending elasticity of the reversible freely jointed chain" Published',
    body: 'Published in Journal of Chemical Physics. By Minsu Yi, Dongju Lee, and Prof. Benetatos. The paper investigates the statistical property of the rFJC, which models the thermally fluctuating bending stiffness on polymer chain.',
    tag: 'Publication',
  },
  {
    date: 'July 2024',
    category: 'Publication',
    title: '"Stretching multistate flexible chains and loops" Published',
    body: 'Published in Physical Review E. By Geunho Noh and Prof. Benetatos. The paper investigates the force-extension behavior of flexible polymer chains and loops with multiple internal states.',
    tag: 'Publication',
  },
  {
    date: 'June 2024',
    category: 'Award',
    title: 'Excellent Lecturer Award',
    body: 'Prof. Benetatos received the Excellent Lecturer Award from the College of Natural Science in recognition of his outstanding contributions to teaching, mentoring future scholars, and advancing educational excellence.',
    tag: 'Award',
  },
  {
    date: 'April 2024',
    category: 'Award',
    title: 'Outstanding Oral Presentation Award — KPS Spring Meeting 2024',
    body: 'Geunho Noh made an excellent presentation on stretching multi-state flexible chains and loops at the Korean Physical Society (KPS) Spring Meeting 2024.',
    tag: 'Award',
  },
].sort((a, b) => {
  const [aMonth, aYear] = a.date.split(' ');
  const [bMonth, bYear] = b.date.split(' ');
  const yearDiff = Number(bYear) - Number(aYear);
  return yearDiff !== 0 ? yearDiff : monthIndex[bMonth] - monthIndex[aMonth];
});
