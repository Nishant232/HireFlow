// ATS-friendly PDF resume generator using pdfmake
// Supports: Personal Info, Summary, Skills, Experience, Projects,
//           Education, Internships, Certifications, Achievements,
//           Positions of Responsibility, Languages, Interests

export interface EducationEntry {
  degree: string;
  branch?: string;
  institution: string;
  startYear: string;
  endYear: string;
  grade?: string;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  responsibilities: string[];
}

export interface ProjectEntry {
  name: string;
  description: string;
  tech: string[];
  githubUrl?: string;
  liveUrl?: string;
}

export interface InternshipEntry {
  role: string;
  organization: string;
  duration: string;
  description: string;
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface AchievementEntry {
  title: string;
  description: string;
}

export interface PositionEntry {
  position: string;
  organization: string;
  description: string;
}

export interface LanguageEntry {
  language: string;
  proficiency: string;
}

export interface ResumeData {
  // Personal Info
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  website?: string;

  // Core sections
  summary: string;
  skills: {
    languages?: string[];
    frameworks?: string[];
    databases?: string[];
    tools?: string[];
    soft?: string[];
  };

  // Multi-entry sections
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  internships?: InternshipEntry[];
  certifications?: CertificationEntry[];
  achievements?: AchievementEntry[];
  positions?: PositionEntry[];
  languages?: LanguageEntry[];
  interests?: string[];
}

// ─────────────────────────────────────────────
// Helper builders
// ─────────────────────────────────────────────
const PRIMARY = '#1e3a5f';
const ACCENT  = '#2563eb';
const GRAY    = '#6b7280';
const DARK    = '#111827';
const LIGHT   = '#374151';

const divider = {
  canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#d1d5db' }],
  margin: [0, 6, 0, 8],
};

const sectionHeader = (title: string) => [
  {
    text: title.toUpperCase(),
    style: 'sectionHeader',
    margin: [0, 10, 0, 4],
  },
  divider,
];

const bullet = (text: string) => ({
  text: `• ${text}`,
  style: 'bulletText',
  margin: [8, 1, 0, 1],
});

function dateRange(start: string, end?: string, current?: boolean): string {
  if (current || !end) return `${start} – Present`;
  return `${start} – ${end}`;
}

// ─────────────────────────────────────────────
// Main builder
// ─────────────────────────────────────────────
export function buildResumeDocDefinition(data: ResumeData) {
  const content: any[] = [];

  // ── HEADER ──────────────────────────────────
  const contactLine = [
    data.email,
    data.phone  ? ` · ${data.phone}`    : '',
    data.location ? ` · ${data.location}` : '',
  ].join('');

  const linksLine = [
    data.linkedin  ? `LinkedIn: ${data.linkedin}`   : '',
    data.github    ? `GitHub: ${data.github}`        : '',
    data.portfolio ? `Portfolio: ${data.portfolio}`  : '',
    data.website   ? `Website: ${data.website}`      : '',
  ].filter(Boolean).join('   ');

  content.push({
    stack: [
      { text: data.name, style: 'name' },
      { text: contactLine, style: 'contact', margin: [0, 3, 0, 2] },
      ...(linksLine ? [{ text: linksLine, style: 'links' }] : []),
    ],
    margin: [0, 0, 0, 6],
  });
  content.push(divider);

  // ── PROFESSIONAL SUMMARY ─────────────────────
  if (data.summary) {
    content.push(...sectionHeader('Professional Summary'));
    content.push({ text: data.summary, style: 'body', margin: [0, 0, 0, 4] });
  }

  // ── TECHNICAL SKILLS ─────────────────────────
  const hasSkills = data.skills && Object.values(data.skills).some(a => a && a.length > 0);
  if (hasSkills) {
    content.push(...sectionHeader('Technical Skills'));
    const s = data.skills;
    const rows: any[] = [];
    if (s.languages?.length)  rows.push([{ text: 'Languages:', style: 'skillLabel' }, { text: s.languages.join(', '), style: 'body' }]);
    if (s.frameworks?.length) rows.push([{ text: 'Frameworks:', style: 'skillLabel' }, { text: s.frameworks.join(', '), style: 'body' }]);
    if (s.databases?.length)  rows.push([{ text: 'Databases:', style: 'skillLabel' }, { text: s.databases.join(', '), style: 'body' }]);
    if (s.tools?.length)      rows.push([{ text: 'Tools:', style: 'skillLabel' }, { text: s.tools.join(', '), style: 'body' }]);
    if (s.soft?.length)       rows.push([{ text: 'Soft Skills:', style: 'skillLabel' }, { text: s.soft.join(', '), style: 'body' }]);
    content.push({
      table: { widths: [90, '*'], body: rows },
      layout: 'noBorders',
      margin: [0, 0, 0, 4],
    });
  }

  // ── EXPERIENCE ───────────────────────────────
  if (data.experience?.length) {
    content.push(...sectionHeader('Work Experience'));
    data.experience.forEach(exp => {
      content.push({
        columns: [
          { text: `${exp.title}`, style: 'jobTitle', width: '*' },
          { text: dateRange(exp.startDate, exp.endDate, exp.current), style: 'duration', width: 'auto' },
        ],
        margin: [0, 4, 0, 0],
      });
      content.push({ text: `${exp.company}${exp.location ? ` · ${exp.location}` : ''}`, style: 'subTitle', margin: [0, 1, 0, 2] });
      exp.responsibilities.forEach(r => content.push(bullet(r)));
      content.push({ text: '', margin: [0, 4, 0, 0] });
    });
  }

  // ── PROJECTS ─────────────────────────────────
  if (data.projects?.length) {
    content.push(...sectionHeader('Projects'));
    data.projects.forEach(proj => {
      const techStr = Array.isArray(proj.tech) ? proj.tech.join(', ') : proj.tech;
      const links = [proj.githubUrl, proj.liveUrl].filter(Boolean).join('   ');
      content.push({
        text: [
          { text: proj.name, bold: true, color: DARK },
          techStr ? { text: `  |  ${techStr}`, color: ACCENT, fontSize: 9 } : '',
        ],
        fontSize: 11,
        margin: [0, 4, 0, 1],
      });
      content.push({ text: proj.description, style: 'bulletText', margin: [8, 1, 0, 1] });
      if (links) content.push({ text: links, style: 'links', margin: [8, 1, 0, 4] });
      else content.push({ text: '', margin: [0, 2, 0, 0] });
    });
  }

  // ── EDUCATION ────────────────────────────────
  if (data.education?.length) {
    content.push(...sectionHeader('Education'));
    data.education.forEach(edu => {
      const degreeStr = edu.branch ? `${edu.degree} — ${edu.branch}` : edu.degree;
      content.push({
        columns: [
          { text: degreeStr, style: 'jobTitle', width: '*' },
          { text: dateRange(edu.startYear, edu.endYear), style: 'duration', width: 'auto' },
        ],
        margin: [0, 4, 0, 0],
      });
      content.push({ text: edu.institution, style: 'subTitle', margin: [0, 1, 0, edu.grade ? 0 : 4] });
      if (edu.grade) content.push({ text: `CGPA / Score: ${edu.grade}`, style: 'bulletText', margin: [8, 1, 0, 4] });
    });
  }

  // ── INTERNSHIPS ──────────────────────────────
  if (data.internships?.length) {
    content.push(...sectionHeader('Internships'));
    data.internships.forEach(i => {
      content.push({
        columns: [
          { text: `${i.role} — ${i.organization}`, style: 'jobTitle', width: '*' },
          { text: i.duration, style: 'duration', width: 'auto' },
        ],
        margin: [0, 4, 0, 2],
      });
      content.push({ text: i.description, style: 'bulletText', margin: [8, 1, 0, 4] });
    });
  }

  // ── CERTIFICATIONS ───────────────────────────
  if (data.certifications?.length) {
    content.push(...sectionHeader('Certifications'));
    data.certifications.forEach(c => {
      content.push({
        columns: [
          { text: `${c.name}  —  ${c.issuer}`, style: 'jobTitle', width: '*' },
          { text: c.date, style: 'duration', width: 'auto' },
        ],
        margin: [0, 4, 0, c.url ? 0 : 4],
      });
      if (c.url) content.push({ text: c.url, style: 'links', margin: [8, 1, 0, 4] });
    });
  }

  // ── ACHIEVEMENTS ─────────────────────────────
  if (data.achievements?.length) {
    content.push(...sectionHeader('Achievements'));
    data.achievements.forEach(a => {
      content.push({ text: a.title, style: 'jobTitle', margin: [0, 4, 0, 1] });
      content.push(bullet(a.description));
    });
    content.push({ text: '', margin: [0, 4, 0, 0] });
  }

  // ── POSITIONS OF RESPONSIBILITY ──────────────
  if (data.positions?.length) {
    content.push(...sectionHeader('Positions of Responsibility'));
    data.positions.forEach(p => {
      content.push({ text: `${p.position}  ·  ${p.organization}`, style: 'jobTitle', margin: [0, 4, 0, 1] });
      content.push(bullet(p.description));
    });
    content.push({ text: '', margin: [0, 4, 0, 0] });
  }

  // ── LANGUAGES ────────────────────────────────
  if (data.languages?.length) {
    content.push(...sectionHeader('Languages'));
    content.push({
      text: data.languages.map(l => `${l.language} (${l.proficiency})`).join('   ·   '),
      style: 'body',
      margin: [0, 0, 0, 4],
    });
  }

  // ── INTERESTS ────────────────────────────────
  if (data.interests?.length) {
    content.push(...sectionHeader('Interests'));
    content.push({ text: data.interests.join('   ·   '), style: 'body', margin: [0, 0, 0, 4] });
  }

  // ─────────────────────────────────────────────
  return {
    content,
    styles: {
      name:          { fontSize: 22, bold: true, color: PRIMARY },
      contact:       { fontSize: 10, color: GRAY },
      links:         { fontSize: 9,  color: ACCENT },
      sectionHeader: { fontSize: 10, bold: true, color: PRIMARY, letterSpacing: 1 },
      jobTitle:      { fontSize: 11, bold: true, color: DARK },
      subTitle:      { fontSize: 10, color: LIGHT, italics: true },
      duration:      { fontSize: 10, color: GRAY, italics: true },
      skillLabel:    { fontSize: 10, bold: true, color: DARK },
      bulletText:    { fontSize: 10, color: LIGHT, lineHeight: 1.3 },
      body:          { fontSize: 10, color: LIGHT, lineHeight: 1.4 },
    },
    defaultStyle: { font: 'Roboto' },
    pageMargins: [40, 40, 40, 40],
    pageSize: 'A4',
  };
}
