type ProductSearchTextInput = {
  name: string;
  shortDescription: string;
  description: string;
  problemSolved: string;
  targetUsers: string;
  mainFeatures: string;
  categoryName?: string | null;
  tags?: string[];
  isAiBuilt?: boolean;
  hasAiFeature?: boolean;
  aiToolsUsed?: string | null;
};

export function buildProductSearchText(input: ProductSearchTextInput) {
  return [
    input.name,
    input.shortDescription,
    input.description,
    input.problemSolved,
    input.targetUsers,
    input.mainFeatures,
    input.categoryName,
    input.tags?.join(" "),
    input.isAiBuilt ? "AI 제작 제품" : null,
    input.hasAiFeature ? "AI 기능 포함 제품" : null,
    input.aiToolsUsed,
  ]
    .filter(Boolean)
    .join("\n")
    .replace(/\s+/g, " ")
    .trim();
}
