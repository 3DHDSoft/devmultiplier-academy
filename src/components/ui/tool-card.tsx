import Link from 'next/link';
import { ExternalLink, Tag, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tool } from '@/lib/tools';

interface ToolCardProps {
  tool: Tool;
  className?: string;
}

export function ToolCard({ tool, className }: ToolCardProps) {
  return (
    <div className={cn('flex flex-col rounded-lg border border-[#d1d9e0] bg-white p-6 transition-shadow hover:shadow-md dark:border-[#30363d] dark:bg-[#161b22]', tool.featured && 'ring-2 ring-[#0969da] dark:ring-[#4493f8]', className)}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-[#1f2328] dark:text-[#e6edf3]">{tool.name}</h3>
            {tool.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#ddf4ff] px-2 py-0.5 text-xs font-medium text-[#0969da] dark:bg-[#388bfd26] dark:text-[#4493f8]">
                <Sparkles className="h-3 w-3" />
                Featured
              </span>
            )}
          </div>
          {tool.discount && (
            <span className="mt-1 inline-flex items-center gap-1 text-sm text-[#1f883d] dark:text-[#3fb950]">
              <Tag className="h-3 w-3" />
              {tool.discount}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="mb-4 text-sm text-[#656d76] dark:text-[#848d97]">{tool.description}</p>

      {/* How I Use It */}
      <div className="mb-4 flex-1 rounded-md bg-[#f6f8fa] p-4 dark:bg-[#21262d]">
        <p className="mb-2 text-xs font-semibold tracking-wider text-[#656d76] uppercase dark:text-[#848d97]">How I Use It</p>
        <p className="text-sm text-[#1f2328] dark:text-[#e6edf3]">{tool.howIUseIt}</p>
      </div>

      {/* Related Courses */}
      {tool.relatedCourses && tool.relatedCourses.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold tracking-wider text-[#656d76] uppercase dark:text-[#848d97]">Taught In</p>
          <div className="flex flex-wrap gap-2">
            {tool.relatedCourses.map((courseSlug) => (
              <Link key={courseSlug} href={`/courses/${courseSlug}`} className="inline-flex rounded-full border border-[#d1d9e0] bg-white px-2 py-0.5 text-xs text-[#656d76] transition-colors hover:border-[#0969da] hover:text-[#0969da] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#848d97] dark:hover:border-[#4493f8] dark:hover:text-[#4493f8]">
                {formatCourseSlug(courseSlug)}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-auto flex gap-3">
        <a href={tool.affiliateUrl} target="_blank" rel="noopener noreferrer" className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#1f883d] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1a7f37] dark:bg-[#238636] dark:hover:bg-[#2ea043]">
          Get {tool.name}
          <ExternalLink className="h-4 w-4" />
        </a>
        <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-md border border-[#d1d9e0] bg-white px-3 py-2 text-sm text-[#656d76] transition-colors hover:bg-[#f6f8fa] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#848d97] dark:hover:bg-[#21262d]" aria-label={`Visit ${tool.name} website`}>
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

// Helper to format course slug to readable name
function formatCourseSlug(slug: string): string {
  const courseNames: Record<string, string> = {
    'ddd-to-cqrs': 'DDD to CQRS',
    'ddd-to-database': 'DDD to Database',
    'database-optimization': 'DB Optimization',
    'data-driven-api': 'REST APIs',
    'ai-ui-design': 'AI UI Design',
  };
  return courseNames[slug] || slug;
}

// Compact version for sidebars or course pages
interface ToolCardCompactProps {
  tool: Tool;
  className?: string;
}

export function ToolCardCompact({ tool, className }: ToolCardCompactProps) {
  return (
    <a href={tool.affiliateUrl} target="_blank" rel="noopener noreferrer" className={cn('flex items-center gap-3 rounded-lg border border-[#d1d9e0] bg-white p-3 transition-all hover:border-[#0969da] hover:shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:hover:border-[#4493f8]', className)}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-[#1f2328] dark:text-[#e6edf3]">{tool.name}</span>
          {tool.discount && <span className="shrink-0 text-xs text-[#1f883d] dark:text-[#3fb950]">{tool.discount}</span>}
        </div>
        <p className="truncate text-xs text-[#656d76] dark:text-[#848d97]">{tool.description}</p>
      </div>
      <ExternalLink className="h-4 w-4 shrink-0 text-[#656d76] dark:text-[#848d97]" />
    </a>
  );
}

export default ToolCard;
