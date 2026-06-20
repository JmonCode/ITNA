const categories = ["AI 도구", "생산성", "디자인", "개발", "교육", "운동/건강", "생활"];

export function MarqueeStrip() {
  return (
    <div className="marquee-strip flex items-center overflow-hidden">
      <div className="container-page flex flex-wrap items-center gap-x-8 gap-y-2 py-2 text-body-sm">
        {categories.map((category) => (
          <span key={category}>{category}</span>
        ))}
      </div>
    </div>
  );
}
