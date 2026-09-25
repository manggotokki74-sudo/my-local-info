const fs = require('fs');
const path = require('path');

async function main() {
  const localInfoPath = path.join(process.cwd(), 'public/data/local-info.json');

  try {
    const publicDataApiKey = process.env.PUBLIC_DATA_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!publicDataApiKey || !geminiApiKey) {
      console.log('환경변수 PUBLIC_DATA_API_KEY 및 GEMINI_API_KEY가 필요합니다.');
      return;
    }

    // [1단계] 공공데이터포털 API에서 데이터 가져오기
    const endpoint = 'https://api.odcloud.kr/api/gov24/v3/serviceList';
    const params = new URLSearchParams({
      page: '1',
      perPage: '20',
      returnType: 'JSON',
      serviceKey: publicDataApiKey,
    });

    const publicDataUrl = `${endpoint}?${params.toString()}`;
    const publicRes = await fetch(publicDataUrl, {
      headers: {
        Authorization: `Infuser ${publicDataApiKey}`,
        Accept: 'application/json',
      },
    });

    if (!publicRes.ok) {
      console.error(`공공데이터 API 호출 실패: ${publicRes.status}`);
      return;
    }

    const publicJson = await publicRes.json();
    const dataList = publicJson.data || publicJson.result || [];

    if (!Array.isArray(dataList) || dataList.length === 0) {
      console.log('공공데이터 응답에 목록이 없습니다.');
      return;
    }

    // 필터링 키워드 검사 함수
    const getItemText = (item) => {
      const name = item['서비스명'] || item.serviceNm || item.name || '';
      const purpose = item['서비스목적요약'] || item.purpose || item.summary || '';
      const target = item['지원대상'] || item.target || '';
      const org = item['소관기관명'] || item.org || '';
      return `${name} ${purpose} ${target} ${org}`;
    };

    let filteredItems = dataList.filter((item) => getItemText(item).includes('성남'));
    if (filteredItems.length === 0) {
      filteredItems = dataList.filter((item) => getItemText(item).includes('경기'));
    }
    if (filteredItems.length === 0) {
      filteredItems = dataList;
    }

    // [2단계] 기존 데이터와 비교
    if (!fs.existsSync(localInfoPath)) {
      console.error('local-info.json 파일이 존재하지 않습니다.');
      return;
    }

    const rawLocalData = fs.readFileSync(localInfoPath, 'utf8');
    const localJson = JSON.parse(rawLocalData);
    const existingItems = localJson.items || [];
    const existingNames = new Set(
      existingItems.map((i) => (i.name || i.title || '').trim())
    );

    const newCandidates = filteredItems.filter((item) => {
      const name = (item['서비스명'] || item.serviceNm || item.name || '').trim();
      return name && !existingNames.has(name);
    });

    if (newCandidates.length === 0) {
      console.log('새로운 데이터가 없습니다');
      return;
    }

    const targetItem = newCandidates[0];

    // [3단계] Gemini AI로 새 항목 1개만 가공
    const promptText = `아래 공공데이터 1건을 분석해서 JSON 객체로 변환해줘. 형식: {id: 숫자, name: 서비스명, category: '행사' 또는 '혜택', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', location: 장소 또는 기관명, target: 지원대상, summary: 한줄요약, link: 상세URL} category는 내용을 보고 행사/축제면 '행사', 지원금/서비스면 '혜택'으로 판단해. startDate가 없으면 오늘 날짜, endDate가 없으면 '상시'로 넣어. 반드시 JSON 객체만 출력해. 다른 텍스트 없이.

공공데이터:
${JSON.stringify(targetItem, null, 2)}`;

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

    const cleanedText = rawContentText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const parsedItem = JSON.parse(cleanedText);

    // [4단계] 기존 데이터에 추가
    const today = new Date().toISOString().split('T')[0];
    localJson.items.push(parsedItem);
    localJson.lastUpdated = today;

    fs.writeFileSync(localInfoPath, JSON.stringify(localJson, null, 2), 'utf8');
    console.log('새로운 데이터 1건이 성공적으로 추가되었습니다.');
  } catch (error) {
    console.error('스크립트 실행 중 에러 발생:', error);
    // 에러 발생 시 기존 local-info.json 유지
  }
}

main();
