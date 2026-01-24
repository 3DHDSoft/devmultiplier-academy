import { Providers } from '@/app/providers';

export const dynamic = 'force-dynamic';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
