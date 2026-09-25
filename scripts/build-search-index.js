const fs = require('fs');
const path = require('path');

function stripMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/^---[\s\S]*?---/g, '')
    .replace(/#+\s+/g, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/`{1,3}([\s\S]*?)`{1,3}/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*>\s+/gm, '')
    .replace(/---/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseFrontmatter(fileContent) {
  let matter;
  try {
    matter = require('gray-matter');
    const parsed = matter(fileContent);
    return { data: parsed.data || {}, body: parsed.content || '' };
  } catch (e) {
    const match = fileContent.match(/^---[\r\n]+([\s\S]*?)[\r\n]+---[\r\n]+/);
    if (!match) return { data: {}, body: fileContent };

    const frontmatterStr = match[1];
    const body = fileContent.slice(match[0].length);
    const data = {};

    frontmatterStr.split('\n').forEach((line) => {
      const colonIdx = line.indexOf(':');
      if (colonIdx !== -1) {
        const key = line.slice(0, colonIdx).trim();
        let val = line.slice(colonIdx + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        data[key] = val;
      }
    });

    return { data, body };
  }
}

function buildSearchIndex() {
  const searchIndex = [];

  // 1. Read public/data/local-info.json
  const localInfoPath = path.join(process.cwd(), 'public', 'data', 'local-info.json');
  if (fs.existsSync(localInfoPath)) {
    try {
      const raw = fs.readFileSync(localInfoPath, 'utf-8');
      const data = JSON.parse(raw);
      const items = data.items || (Array.isArray(data) ? data : []);
      items.forEach((item) => {
        const title = item.title || item.name || '';
        const summary = item.summary || '';
        const description = item.description || '';
        const rawContent = description || summary;
        const plainContent = stripMarkdown(rawContent);

        searchIndex.push({
          id: String(item.id || title),
          type: 'local-info',
          title: title,
          category: item.category || '',
          summary: summary,
          content: plainContent.slice(0, 500),
          link: item.link || '',
          location: item.location || '',
          target: item.target || '',
        });
      });
    } catch (e) {
      console.error('Error reading local-info.json:', e);
    }
  }

  // 2. Read src/content/posts/*.md
  const postsDir = path.join(process.cwd(), 'src', 'content', 'posts');
  if (fs.existsSync(postsDir)) {
    const files = fs.readdirSync(postsDir);
    files.forEach((file) => {
      if (file.endsWith('.md')) {
        const filePath = path.join(postsDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data, body } = parseFrontmatter(fileContent);
        const title = data.title || file.replace(/\.md$/, '');
        const summary = data.summary || '';
        const plainBody = stripMarkdown(body);

        searchIndex.push({
          id: file.replace(/\.md$/, ''),
          type: 'blog-post',
          title: title,
          category: data.category || '블로그',
          summary: summary,
          content: plainBody.slice(0, 500),
          date: data.date || '',
          slug: file.replace(/\.md$/, ''),
        });
      }
    });
  }

  // Save to public/data/search-index.json
  const outputDir = path.join(process.cwd(), 'public', 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'search-index.json');
  fs.writeFileSync(outputPath, JSON.stringify(searchIndex, null, 2), 'utf-8');

  console.log(`Search index built: ${searchIndex.length} entries`);
}

buildSearchIndex();
