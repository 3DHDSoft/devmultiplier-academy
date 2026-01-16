// Tools and affiliate links data
// Replace placeholder URLs with your actual affiliate links

export interface Tool {
  id: string;
  name: string;
  description: string;
  howIUseIt: string;
  category: ToolCategory;
  affiliateUrl: string; // Replace with your affiliate link
  websiteUrl: string; // Non-affiliate link for transparency
  logo?: string; // Optional logo URL
  discount?: string; // e.g., "20% off first month"
  featured?: boolean;
  relatedCourses?: string[]; // Course slugs where this tool is taught
}

export type ToolCategory = 'video' | 'voice' | 'code' | 'design' | 'infrastructure' | 'productivity';

export const categoryInfo: Record<ToolCategory, { name: string; description: string }> = {
  video: {
    name: 'AI Video Creation',
    description: 'Create professional video content with AI-powered tools',
  },
  voice: {
    name: 'AI Voice & Audio',
    description: 'Generate natural-sounding voiceovers and audio content',
  },
  code: {
    name: 'AI Coding Assistants',
    description: 'Write, review, and debug code faster with AI',
  },
  design: {
    name: 'AI Design & UI',
    description: 'Design interfaces and generate UI components with AI',
  },
  infrastructure: {
    name: 'Infrastructure & Hosting',
    description: 'Deploy and scale your applications',
  },
  productivity: {
    name: 'Productivity & Workflow',
    description: 'Streamline your development workflow',
  },
};

export const tools: Tool[] = [
  // === VIDEO CREATION ===
  {
    id: 'heygen',
    name: 'HeyGen',
    description:
      'AI video generation platform that creates professional videos with AI avatars. Perfect for course intros, explanations, and promotional content.',
    howIUseIt:
      "I use HeyGen to create the virtual presenter videos for each course. It lets me generate consistent, professional video content without expensive equipment or editing skills. The AI avatars deliver my scripts naturally, and I can update videos quickly when content changes.",
    category: 'video',
    affiliateUrl: 'https://heygen.com/?ref=PLACEHOLDER', // Replace with your affiliate link
    websiteUrl: 'https://heygen.com',
    discount: 'Get started free',
    featured: true,
    relatedCourses: ['ai-ui-design'],
  },
  {
    id: 'synthesia',
    name: 'Synthesia',
    description:
      'Enterprise-grade AI video creation platform with diverse avatars and 120+ languages. Great for localized content.',
    howIUseIt:
      'I use Synthesia when I need to create videos in multiple languages or want a different avatar style. Their enterprise features are excellent for larger projects.',
    category: 'video',
    affiliateUrl: 'https://www.synthesia.io/?ref=PLACEHOLDER', // Replace with your affiliate link
    websiteUrl: 'https://www.synthesia.io',
    relatedCourses: ['ai-ui-design'],
  },

  // === VOICE & AUDIO ===
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    description:
      'The most natural-sounding AI voice generation. Create voiceovers that are indistinguishable from human recordings.',
    howIUseIt:
      "ElevenLabs powers the voiceovers in my course videos. The voice cloning feature lets me maintain a consistent voice across all content. I've also used it to create audio versions of written lessons for students who prefer listening.",
    category: 'voice',
    affiliateUrl: 'https://elevenlabs.io/?ref=PLACEHOLDER', // Replace with your affiliate link
    websiteUrl: 'https://elevenlabs.io',
    discount: 'Free tier available',
    featured: true,
    relatedCourses: ['ai-ui-design'],
  },
  {
    id: 'descript',
    name: 'Descript',
    description:
      'All-in-one audio/video editing with AI transcription, overdub, and studio sound. Edit audio like a document.',
    howIUseIt:
      'I use Descript to clean up audio recordings and fix mistakes without re-recording. The "Overdub" feature lets me correct script errors by just typing the fix. Amazing for podcast-style content.',
    category: 'voice',
    affiliateUrl: 'https://www.descript.com/?ref=PLACEHOLDER', // Replace with your affiliate link
    websiteUrl: 'https://www.descript.com',
    relatedCourses: ['ai-ui-design'],
  },

  // === CODE ASSISTANTS ===
  {
    id: 'claude',
    name: 'Claude (Anthropic)',
    description:
      "Anthropic's AI assistant. Excellent for code generation, review, explanation, and pair programming. Powers this platform.",
    howIUseIt:
      "Claude is my primary AI collaborator. I use it for everything from writing code to generating course content. It's particularly good at understanding complex architectural patterns and explaining them clearly. This entire platform was built with Claude's assistance.",
    category: 'code',
    affiliateUrl: 'https://claude.ai', // Claude doesn't have affiliate program currently
    websiteUrl: 'https://claude.ai',
    featured: true,
    relatedCourses: ['ddd-to-cqrs', 'ai-ui-design', 'data-driven-api'],
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    description:
      "Anthropic's agentic coding tool. Runs in your terminal and can autonomously complete complex coding tasks across your entire codebase.",
    howIUseIt:
      "Claude Code built most of this platform. It handles multi-file refactors, implements features from descriptions, and runs tests automatically. It's like having a senior developer who never gets tired.",
    category: 'code',
    affiliateUrl: 'https://claude.ai/code', // No affiliate program currently
    websiteUrl: 'https://claude.ai/code',
    featured: true,
    relatedCourses: ['ai-ui-design', 'ddd-to-cqrs', 'data-driven-api'],
  },
  {
    id: 'cursor',
    name: 'Cursor',
    description:
      'AI-first code editor built on VS Code. Integrates Claude and GPT directly into your coding workflow with smart autocomplete and chat.',
    howIUseIt:
      "Cursor is my daily driver for coding. The AI autocomplete is incredibly accurate, and the inline chat lets me refactor code without context-switching. I especially love the 'Composer' feature for multi-file edits.",
    category: 'code',
    affiliateUrl: 'https://cursor.com/?ref=PLACEHOLDER', // Replace with your affiliate link
    websiteUrl: 'https://cursor.com',
    relatedCourses: ['ai-ui-design', 'ddd-to-cqrs'],
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    description:
      'AI pair programmer that suggests code completions in real-time. Deep integration with VS Code and JetBrains IDEs.',
    howIUseIt:
      "I use Copilot alongside Claude for real-time code suggestions. It's excellent for boilerplate code and common patterns. The chat feature is useful for quick questions without leaving your editor.",
    category: 'code',
    affiliateUrl: 'https://github.com/features/copilot', // No affiliate program
    websiteUrl: 'https://github.com/features/copilot',
    relatedCourses: ['ai-ui-design', 'ddd-to-cqrs'],
  },

  // === DESIGN & UI ===
  {
    id: 'v0',
    name: 'v0 by Vercel',
    description:
      'AI-powered UI generation. Describe what you want, get production-ready React/Tailwind components instantly.',
    howIUseIt:
      'v0 is my go-to for rapid UI prototyping. I describe a component, it generates the code, and I iterate from there. Many components on this platform started as v0 generations that I then customized.',
    category: 'design',
    affiliateUrl: 'https://v0.dev/?ref=PLACEHOLDER', // Replace with your affiliate link
    websiteUrl: 'https://v0.dev',
    featured: true,
    relatedCourses: ['ai-ui-design'],
  },
  {
    id: 'figma',
    name: 'Figma',
    description:
      'Collaborative design tool with AI features. Industry standard for UI/UX design with powerful prototyping.',
    howIUseIt:
      'I use Figma for wireframing and design system documentation. Their AI features help generate variations and suggest improvements. Great for collaborating with designers.',
    category: 'design',
    affiliateUrl: 'https://www.figma.com/?ref=PLACEHOLDER', // Replace with your affiliate link
    websiteUrl: 'https://www.figma.com',
    relatedCourses: ['ai-ui-design'],
  },

  // === INFRASTRUCTURE ===
  {
    id: 'vercel',
    name: 'Vercel',
    description:
      'The platform for frontend developers. Zero-config deployments, edge functions, and seamless Next.js integration.',
    howIUseIt:
      "DevMultiplier Academy runs on Vercel. Push to main, and it's live in seconds. The preview deployments for PRs are invaluable for testing changes before they go live.",
    category: 'infrastructure',
    affiliateUrl: 'https://vercel.com/?ref=PLACEHOLDER', // Replace with your affiliate link
    websiteUrl: 'https://vercel.com',
    featured: true,
    relatedCourses: ['ai-ui-design', 'data-driven-api'],
  },
  {
    id: 'neon',
    name: 'Neon',
    description:
      'Serverless PostgreSQL with branching. Scale to zero, instant database cloning for development and testing.',
    howIUseIt:
      "Neon's branching feature is a game-changer for development. I can create a database branch, test migrations, and merge or discard without affecting production. The serverless scaling keeps costs low.",
    category: 'infrastructure',
    affiliateUrl: 'https://neon.tech/?ref=PLACEHOLDER', // Replace with your affiliate link
    websiteUrl: 'https://neon.tech',
    featured: true,
    relatedCourses: ['ddd-to-database', 'database-optimization'],
  },
  {
    id: 'supabase',
    name: 'Supabase',
    description:
      'Open source Firebase alternative with PostgreSQL database, auth, storage, and real-time subscriptions.',
    howIUseIt:
      'Supabase provides the PostgreSQL database for course data. Their auth integration is solid, and the dashboard makes database management easy. Great for rapid prototyping that scales.',
    category: 'infrastructure',
    affiliateUrl: 'https://supabase.com/?ref=PLACEHOLDER', // Replace with your affiliate link
    websiteUrl: 'https://supabase.com',
    relatedCourses: ['ddd-to-database', 'database-optimization'],
  },

  // === PRODUCTIVITY ===
  {
    id: 'notion',
    name: 'Notion',
    description:
      'All-in-one workspace for notes, docs, wikis, and project management. Now with AI-powered writing assistance.',
    howIUseIt:
      'Notion is where I plan courses, outline lessons, and organize research. The AI features help me expand outlines into full content drafts that I then refine.',
    category: 'productivity',
    affiliateUrl: 'https://www.notion.so/?ref=PLACEHOLDER', // Replace with your affiliate link
    websiteUrl: 'https://www.notion.so',
    relatedCourses: [],
  },
  {
    id: 'raycast',
    name: 'Raycast',
    description:
      'Blazingly fast launcher for Mac with AI built-in. Quick access to AI chat, clipboard history, and custom scripts.',
    howIUseIt:
      'Raycast is my productivity hub. I use it to quickly query Claude, manage snippets, and run custom scripts. The AI commands feature lets me build custom AI workflows.',
    category: 'productivity',
    affiliateUrl: 'https://www.raycast.com/?ref=PLACEHOLDER', // Replace with your affiliate link
    websiteUrl: 'https://www.raycast.com',
    relatedCourses: [],
  },
];

// Get tools by category
export function getToolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter((tool) => tool.category === category);
}

// Get featured tools
export function getFeaturedTools(): Tool[] {
  return tools.filter((tool) => tool.featured);
}

// Get tools for a specific course
export function getToolsForCourse(courseSlug: string): Tool[] {
  return tools.filter((tool) => tool.relatedCourses?.includes(courseSlug));
}

// Get all categories that have tools
export function getCategories(): ToolCategory[] {
  const categories = new Set(tools.map((tool) => tool.category));
  return Array.from(categories);
}
