const fs = require('fs');
const path = require('path');

async function main() {
  const localInfoPath = path.join(process.cwd(), 'public/data/local-info.json');
  const postsDir = path.join(process.cwd(), 'src/content/posts');

  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      console.log('환경변수 GEMINI_API_KEY가 필요합니다.');
      return;
    }

    // [1단계] 최신 데이터 확인
    if (!fs.existsSync(localInfoPath)) {
      console.error('local-info.json 파일이 존재하지 않습니다.');
      return;
    }

    const rawLocalData = fs.readFileSync(localInfoPath, 'utf8');
    const localJson = JSON.parse(rawLocalData);
    const items = localJson.items || [];

    if (items.length === 0) {
      console.log('local-info.json에 데이터 항목이 없습니다.');
      return;
    }

    // 배열의 마지막 항목을 읽어옴
    const lastItem = items[items.length - 1];
    const targetName = (lastItem.name || lastItem.title || '').trim();

    // src/content/posts/ 폴더의 기존 파일들과 비교해서 이미 같은 name으로 글이 있으면 종료
    if (fs.existsSync(postsDir)) {
      const files = fs.readdirSync(postsDir);
      for (const file of files) {
        if (file.endsWith('.md')) {
          const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
          if (targetName && content.includes(targetName)) {
            console.log('이미 작성된 글입니다');
            return;
          }
        }
      }
    } else {
      fs.mkdirSync(postsDir, { recursive: true });
    }

    // [2단계] Gemini AI로 블로그 글 생성
    const today = new Date().toISOString().split('T')[0];
    const promptText = `아래 공공서비스 정보를 바탕으로 블로그 글을 작성해줘.

정보: ${JSON.stringify(lastItem, null, 2)}

아래 형식으로 출력해줘. 반드시 이 형식만 출력하고 다른 텍스트는 없이:
---
title: (친근하고 흥미로운 제목)
date: ${today}
summary: (한 줄 요약)
category: 정보
tags: [태그1, 태그2, 태그3]
---

(본문: 800자 이상, 친근한 블로그 톤, 추천 이유 3가지 포함, 신청 방법 안내)

마지막 줄에 FILENAME: ${today}-keyword 형식으로 파일명도 출력해줘. 키워드는 영문으로.`;

    let geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    let geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptText }],
          },
        ],
      }),
    });

    if (geminiRes.status === 404) {
      geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiApiKey}`;
      geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: promptText }],
            },
          ],
        }),
      });
    }

    if (!geminiRes.ok) {
      console.error(`Gemini API 호출 실패: ${geminiRes.status}`);
      return;
    }

    const geminiJson = await geminiRes.json();
    const rawContentText =
      geminiJson.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let cleanedText = rawContentText
      .replace(/^```markdown\n?/i, '')
      .replace(/^```\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim();

    // [3단계] 파일 저장
    const filenameMatch = cleanedText.match(/FILENAME:\s*([^\s\n\r]+)/i);
    let fileName = '';
    let markdownBody = cleanedText;

    if (filenameMatch) {
      let extractedName = filenameMatch[1].trim();
      if (!extractedName.endsWith('.md')) {
        extractedName += '.md';
      }
      fileName = extractedName;
      // FILENAME 줄 제거
      markdownBody = cleanedText.replace(/FILENAME:\s*[^\s\n\r]+/gi, '').trim();
    } else {
      const sanitizedName = targetName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      fileName = `${today}-${sanitizedName || 'post'}.md`;
    }

    const targetFilePath = path.join(postsDir, fileName);
    fs.writeFileSync(targetFilePath, markdownBody, 'utf8');
    console.log(`블로그 포스트가 성공적으로 작성되었습니다: ${fileName}`);
  } catch (error) {
    console.error('스크립트 실행 중 에러 발생:', error);
    // 에러 발생 시 기존 파일 유지
  }
}

main();
