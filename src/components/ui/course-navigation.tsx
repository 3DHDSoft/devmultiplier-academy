import Link from 'next/link';

export interface NavigationItem {
  href: string;
  label: string;
}

interface CourseNavigationProps {
  previous?: NavigationItem | null;
  up?: NavigationItem | null;
  next?: NavigationItem | null;
}

/**
 * Course navigation component with Previous/Up/Next links
 * Displayed as a table at the bottom of course pages
 */
export function CourseNavigation({ previous, up, next }: CourseNavigationProps) {
  // Don't render if there's no navigation
  if (!previous && !up && !next) {
    return null;
  }

  return (
    <div className="mt-12 border-t border-[#d1d9e0] pt-8 dark:border-[#30363d]">
      <h2 className="mb-4 text-xl font-semibold text-[#1f2328] dark:text-[#e6edf3]">Navigation</h2>
      <div className="overflow-hidden rounded-md border border-[#d1d9e0] dark:border-[#30363d]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#d1d9e0] bg-[#f6f8fa] dark:border-[#30363d] dark:bg-[#161b22]">
              <th className="px-4 py-3 text-left text-sm font-semibold text-[#1f2328] dark:text-[#e6edf3]">Previous</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-[#1f2328] dark:text-[#e6edf3]">Up</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-[#1f2328] dark:text-[#e6edf3]">Next</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white dark:bg-[#0d1117]">
              <td className="px-4 py-4 align-top">
                {previous ? (
                  <Link
                    href={previous.href}
                    className="text-[#0969da] hover:underline dark:text-[#4493f8]"
                  >
                    {previous.label}
                  </Link>
                ) : (
                  <span className="text-[#656d76] dark:text-[#848d97]">—</span>
                )}
              </td>
              <td className="px-4 py-4 align-top">
                {up ? (
                  <Link
                    href={up.href}
                    className="text-[#0969da] hover:underline dark:text-[#4493f8]"
                  >
                    {up.label}
                  </Link>
                ) : (
                  <span className="text-[#656d76] dark:text-[#848d97]">—</span>
                )}
              </td>
              <td className="px-4 py-4 align-top">
                {next ? (
                  <Link
                    href={next.href}
                    className="text-[#0969da] hover:underline dark:text-[#4493f8]"
                  >
                    {next.label}
                  </Link>
                ) : (
                  <span className="text-[#656d76] dark:text-[#848d97]">—</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CourseNavigation;
