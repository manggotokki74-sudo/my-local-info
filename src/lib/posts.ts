import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface PostFrontmatter {
  title: string;
  date: string;
  summary: string;
  category: string;
  tags: string[];
}

export interface Post extends PostFrontmatter {
  slug: string;
  content: string;
}

const postsDirectory = path.join(process.cwd(), 'src/content/posts');

function formatDate(dateInput: any): string {
  if (!dateInput) return '';
  if (dateInput instanceof Date) {
    const year = dateInput.getFullYear();
    const month = String(dateInput.getMonth() + 1).padStart(2, '0');
    const day = String(dateInput.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  if (typeof dateInput === 'string') {
    return dateInput.split('T')[0];
  }
  return String(dateInput);
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      const { data, content } = matter(fileContents);

      const formattedDate = formatDate(data.date);

      return {
        slug,
        title: data.title || slug,
        date: formattedDate,
        summary: data.summary || '',
        category: data.category || '일반',
        tags: Array.isArray(data.tags) ? data.tags : [],
        content,
      };
    });

  // 날짜순 정렬 (최신순)
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const formattedDate = formatDate(data.date);

    return {
      slug,
      title: data.title || slug,
      date: formattedDate,
      summary: data.summary || '',
      category: data.category || '일반',
      tags: Array.isArray(data.tags) ? data.tags : [],
      content,
    };
  } catch {
    return null;
  }
}

export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => fileName.replace(/\.md$/, ''));
}
