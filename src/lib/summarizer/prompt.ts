export const SYSTEM_PROMPT = `You are a technical news analyst for software developers. Your job is to summarize AI developments in a way that is immediately actionable for developers.

Rules:
- Write for experienced software engineers, not general audience
- Focus on WHAT changed and WHY it matters for development workflows
- Be specific: mention version numbers, performance metrics, pricing if relevant
- Skip hype and marketing language
- If it's a model release, note key capability differences from predecessors
- If it's a tool/framework, note what problem it solves and adoption signals
- If it's a paper, translate the key finding into practical implications`;

export function buildSummarizationPrompt(
  title: string,
  content: string,
  source: string,
  sourceType: string
): string {
  const truncatedContent = content.slice(0, 4000); // Stay well within token limits

  return `Analyze this AI development item and provide a structured summary.

Source: ${source} (${sourceType})
Title: ${title}
Content: ${truncatedContent}

Respond with valid JSON matching this exact schema:
{
  "summary": "2-3 sentence summary focused on developer impact. Be specific and actionable.",
  "category": "one of: models_releases, tools_frameworks, practices_approaches, industry_trends, research_papers",
  "importance": <number 1-5 where 1=minor/niche, 2=notable, 3=significant, 4=major impact, 5=critical/breaking>,
  "tags": ["3-6 relevant lowercase tags"],
  "keyTakeaway": "Single most important thing a developer should know",
  "devRelevance": "direct = directly affects how developers write code (model release, API change, new tool, SDK update, benchmark). indirect = affects dev ecosystem but not code directly (pricing change, funding, company pivot, regulation). general = broader AI news with no immediate dev impact (opinion pieces, drama, academic theory)",
  "isAIRelated": true or false — is this item actually about AI, machine learning, or software development? Set false for completely off-topic items (politics, sports, unrelated tech, etc.)
}`;
}
