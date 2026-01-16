// Instructor and AI collaborator data for the platform
// Ivan Farkas is the course creator - a real person
// Claude is acknowledged as the AI co-creator - transparent about AI assistance

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  title: string;
  bio: string;
  expertise: string[];
  isAI?: boolean; // Flag to indicate AI collaborator
  avatar?: string; // URL to avatar image (optional)
  social?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}

// For backward compatibility
export type Instructor = TeamMember;

// Platform Creator - the real person behind DevMultiplier Academy
export const platformCreator: TeamMember = {
  id: 'ivan-farkas',
  name: 'Ivan Farkas',
  role: 'Founder & Course Creator',
  title: 'Founder & CEO, DevMultiplier Academy',
  bio: "I'm not just teaching AI-assisted development—I'm using it every day to build this platform. With 30+ years in software architecture, I founded DevMultiplier Academy to help experienced developers leverage AI as a force multiplier. These courses aren't theoretical; they're born from hands-on experience building real systems with AI collaboration.",
  expertise: ['Software Architecture', 'AI-Assisted Development', 'Technical Leadership', 'System Design', 'DDD/CQRS'],
  social: {
    github: 'ivanfarkas',
    linkedin: 'ivanfarkas',
  },
};

// AI Co-Creator - transparent about AI assistance
export const aiCollaborator: TeamMember = {
  id: 'claude',
  name: 'Claude',
  role: 'AI Co-Creator',
  title: 'AI Development Partner',
  bio: "I'm Claude, an AI assistant by Anthropic. I collaborate with Ivan on course content, code examples, and platform development. This transparency matters—you're learning AI-assisted development from a team that actually practices it. Every lesson demonstrates the human-AI collaboration we teach.",
  expertise: ['Content Development', 'Code Generation', 'Technical Writing', 'Pattern Recognition'],
  isAI: true,
};

// For backward compatibility - platformCEO alias
export const platformCEO = platformCreator;

// Course-specific instructor is always Ivan (no fictional personas)
// But we can have different "focus areas" per course
export const courseFocus: Record<string, { tagline: string; focus: string }> = {
  'ddd-to-cqrs': {
    tagline: 'From Domain Models to Event-Driven Architecture',
    focus: "In this course, I share patterns I've used to decompose complex domains and implement CQRS in production systems. Claude helped me articulate these patterns and generate comprehensive code examples.",
  },
  'ddd-to-database': {
    tagline: 'Bridging Domain Design and Data Persistence',
    focus: "Database schema design is where theory meets reality. I'll show you the mapping strategies I've refined over decades, with AI-assisted examples that demonstrate multiple approaches.",
  },
  'database-optimization': {
    tagline: 'Performance Tuning with AI Assistance',
    focus: "Query optimization used to require deep expertise and hours of analysis. Now, with AI tools, we can identify bottlenecks faster. I'll show you how I combine experience with AI insights.",
  },
  'data-driven-api': {
    tagline: 'Designing APIs That Scale',
    focus: "Good API design is about understanding your data and your consumers. I've designed APIs used by thousands of developers, and I'll show you how AI accelerates the design process.",
  },
  'ai-ui-design': {
    tagline: 'Building UIs at AI Speed',
    focus: "This platform you're using right now? Built with AI assistance. I'll teach you the exact workflows I use to go from idea to production UI in a fraction of the traditional time.",
  },
};

// Default course focus
export const defaultCourseFocus = {
  tagline: 'Expert-Led, AI-Assisted Learning',
  focus: "Every course combines my decades of real-world experience with AI-powered content development. You're learning from someone who practices what they preach.",
};

// Get instructor for a specific course (always Ivan)
export function getInstructorForCourse(_courseSlug: string): TeamMember {
  return platformCreator;
}

// Get course-specific focus/tagline
export function getCourseFocus(courseSlug: string) {
  return courseFocus[courseSlug] || defaultCourseFocus;
}

// Get all team members (for team page)
export function getAllTeamMembers(): TeamMember[] {
  return [platformCreator, aiCollaborator];
}

// Backward compatibility exports
export const courseInstructors: Record<string, TeamMember> = {};
export const defaultInstructor = platformCreator;
