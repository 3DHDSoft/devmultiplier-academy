import { Github, Linkedin, Twitter } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Instructor } from '@/lib/instructors';

interface InstructorCardProps {
  instructor: Instructor;
  variant?: 'full' | 'compact';
  className?: string;
}

// Generate initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Generate a consistent color based on name
function getAvatarColor(name: string): string {
  const colors = [
    'bg-[#0969da] dark:bg-[#4493f8]', // Blue
    'bg-[#1f883d] dark:bg-[#3fb950]', // Green
    'bg-[#9a6700] dark:bg-[#d29922]', // Yellow
    'bg-[#8250df] dark:bg-[#a371f7]', // Purple
    'bg-[#bf3989] dark:bg-[#db61a2]', // Pink
    'bg-[#0550ae] dark:bg-[#58a6ff]', // Dark Blue
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

export function InstructorCard({ instructor, variant = 'full', className }: InstructorCardProps) {
  const initials = getInitials(instructor.name);
  const avatarColor = getAvatarColor(instructor.name);

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-4 rounded-lg border border-[#d1d9e0] bg-white p-4 dark:border-[#30363d] dark:bg-[#161b22]',
          className
        )}
      >
        {/* Avatar */}
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white',
            avatarColor
          )}
        >
          {initials}
        </div>
        {/* Info */}
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-[#1f2328] dark:text-[#e6edf3]">{instructor.name}</h3>
          <p className="truncate text-sm text-[#656d76] dark:text-[#848d97]">{instructor.role}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-[#d1d9e0] bg-white p-6 dark:border-[#30363d] dark:bg-[#161b22]',
        className
      )}
    >
      {/* Header with avatar */}
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-semibold text-white',
            avatarColor
          )}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-[#1f2328] dark:text-[#e6edf3]">{instructor.name}</h3>
          <p className="text-sm font-medium text-[#0969da] dark:text-[#4493f8]">{instructor.role}</p>
          {instructor.title && (
            <p className="mt-1 text-sm text-[#656d76] dark:text-[#848d97]">{instructor.title}</p>
          )}
        </div>
      </div>

      {/* Bio */}
      <p className="mt-4 text-sm leading-relaxed text-[#656d76] dark:text-[#848d97]">{instructor.bio}</p>

      {/* Expertise tags */}
      {instructor.expertise.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {instructor.expertise.map((skill) => (
            <span
              key={skill}
              className="inline-flex rounded-full border border-[#d1d9e0] bg-[#f6f8fa] px-3 py-1 text-xs font-medium text-[#656d76] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#848d97]"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Social links */}
      {instructor.social && (
        <div className="mt-4 flex gap-3 border-t border-[#d1d9e0] pt-4 dark:border-[#30363d]">
          {instructor.social.github && (
            <a
              href={`https://github.com/${instructor.social.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#656d76] transition-colors hover:text-[#1f2328] dark:text-[#848d97] dark:hover:text-[#e6edf3]"
              aria-label={`${instructor.name}'s GitHub profile`}
            >
              <Github className="h-5 w-5" />
            </a>
          )}
          {instructor.social.linkedin && (
            <a
              href={`https://linkedin.com/in/${instructor.social.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#656d76] transition-colors hover:text-[#0a66c2] dark:text-[#848d97] dark:hover:text-[#4493f8]"
              aria-label={`${instructor.name}'s LinkedIn profile`}
            >
              <Linkedin className="h-5 w-5" />
            </a>
          )}
          {instructor.social.twitter && (
            <a
              href={`https://twitter.com/${instructor.social.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#656d76] transition-colors hover:text-[#1da1f2] dark:text-[#848d97] dark:hover:text-[#4493f8]"
              aria-label={`${instructor.name}'s Twitter profile`}
            >
              <Twitter className="h-5 w-5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// Section component for course pages
interface InstructorSectionProps {
  instructor: Instructor;
  courseFocus?: {
    tagline: string;
    focus: string;
  };
  className?: string;
}

export function InstructorSection({ instructor, courseFocus, className }: InstructorSectionProps) {
  return (
    <section className={cn('py-8', className)}>
      <h2 className="mb-6 text-xl font-semibold text-[#1f2328] dark:text-[#e6edf3]">Your Instructor</h2>
      <InstructorCard
        instructor={instructor}
        variant="full"
      />
      {courseFocus && (
        <div className="mt-4 rounded-lg border border-[#54aeff66] bg-[#ddf4ff] p-4 dark:border-[#4493f866] dark:bg-[#388bfd26]">
          <p className="text-sm font-medium text-[#0969da] dark:text-[#4493f8]">{courseFocus.tagline}</p>
          <p className="mt-2 text-sm text-[#656d76] dark:text-[#848d97]">{courseFocus.focus}</p>
        </div>
      )}
    </section>
  );
}

export default InstructorCard;
