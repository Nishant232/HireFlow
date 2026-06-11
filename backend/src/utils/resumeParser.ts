import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export interface ParsedResume {
  text: string;
  urls: string[];
  sections: {
    experience: string;
    education: string;
    skills: string;
    summary: string;
    raw: string;
  };
  wordCount: number;
  fileType: 'pdf' | 'docx';
}

// Extract all URLs from text
export function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
  const matches = text.match(urlRegex) || [];
  // Deduplicate
  return [...new Set(matches)];
}

// Detect resume sections heuristically
function detectSections(text: string) {
  const lines = text.split('\n');
  const sections = {
    experience: '',
    education: '',
    skills: '',
    summary: '',
    raw: text,
  };

  let currentSection = '';
  const sectionBuffer: Record<string, string[]> = {
    experience: [],
    education: [],
    skills: [],
    summary: [],
  };

  for (const line of lines) {
    const lower = line.toLowerCase().trim();

    if (/^(experience|work experience|employment|career)/i.test(lower)) {
      currentSection = 'experience';
    } else if (/^(education|academic|qualification)/i.test(lower)) {
      currentSection = 'education';
    } else if (/^(skills|technical skills|core competencies|technologies)/i.test(lower)) {
      currentSection = 'skills';
    } else if (/^(summary|objective|profile|about)/i.test(lower)) {
      currentSection = 'summary';
    } else if (currentSection && line.trim()) {
      sectionBuffer[currentSection]?.push(line);
    }
  }

  sections.experience = sectionBuffer.experience.join('\n');
  sections.education = sectionBuffer.education.join('\n');
  sections.skills = sectionBuffer.skills.join('\n');
  sections.summary = sectionBuffer.summary.join('\n');

  return sections;
}

// Parse PDF file
export async function parsePDF(buffer: Buffer): Promise<ParsedResume> {
  const data = await pdfParse(buffer);
  const text = data.text;
  const urls = extractUrls(text);
  const sections = detectSections(text);

  return {
    text,
    urls,
    sections,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    fileType: 'pdf',
  };
}

// Parse DOCX file
export async function parseDOCX(buffer: Buffer): Promise<ParsedResume> {
  const result = await mammoth.extractRawText({ buffer });
  const text = result.value;
  const urls = extractUrls(text);
  const sections = detectSections(text);

  return {
    text,
    urls,
    sections,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    fileType: 'docx',
  };
}

// Auto-detect file type and parse
export async function parseResume(
  buffer: Buffer,
  mimeType: string
): Promise<ParsedResume> {
  if (mimeType === 'application/pdf') {
    return parsePDF(buffer);
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    return parseDOCX(buffer);
  } else {
    throw new Error('Unsupported file type. Please upload PDF or DOCX.');
  }
}
