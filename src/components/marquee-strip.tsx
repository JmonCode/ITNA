const categories = [
  "AI 도구",
  "생산성",
  "디자인",
  "개발",
  "교육",
  "운동/건강",
  "생활",
  "마케팅",
  "재무/회계",
  "커뮤니케이션",
  "데이터 분석",
  "자동화",
];

const SEPARATOR = "·";

export function MarqueeStrip() {
  /* 동일한 목록을 두 번 렌더링해서 끊김 없는 무한 스크롤 구현 */
  const itemList = categories.flatMap((cat, i) => [
    <span key={`s-${i}`} className="opacity-40" aria-hidden="true">
      {SEPARATOR}
    </span>,
    <span key={`c-${i}`} className="whitespace-nowrap">
      {cat}
    </span>,
  ]);

  return (
    <div className="marquee-strip flex items-center" aria-label="카테고리 목록">
      <div className="marquee-track text-body-sm">
        {itemList}
        {/* 복제본 — 무한 스크롤 */}
        {itemList}
      </div>
    </div>
  );
}
