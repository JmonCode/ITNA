insert into public.categories (name, slug, description)
values
  ('생산성', 'productivity', '업무와 개인 생산성을 높이는 도구'),
  ('디자인', 'design', '디자인 제작, 협업, 피드백 도구'),
  ('개발', 'development', '개발자와 소프트웨어 제작자를 위한 도구'),
  ('마케팅', 'marketing', '마케팅, 콘텐츠 배포, 성장 도구'),
  ('글쓰기', 'writing', '글쓰기, 편집, 문서화 도구'),
  ('교육', 'education', '학습, 강의, 자기계발 도구'),
  ('운동/건강', 'health-fitness', '운동, 건강, 루틴 관리 도구'),
  ('금융', 'finance', '개인/사업 금융 관리 도구'),
  ('생활', 'life', '일상생활 문제를 해결하는 도구'),
  ('커뮤니티', 'community', '사람과 그룹을 연결하는 도구'),
  ('엔터테인먼트', 'entertainment', '재미와 여가를 위한 제품'),
  ('AI 도구', 'ai-tools', 'AI 기능이 포함된 제품과 AI 제작 도구'),
  ('기타', 'other', '분류되지 않은 유용한 제품')
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    is_active = true,
    updated_at = now();
