import { Hero } from '@/components/sections/hero';
import { Courses } from '@/components/sections/courses';
import { Pricing } from '@/components/sections/pricing';
import { CTA } from '@/components/sections/cta';

export default function Home() {
  return (
    <>
      <Hero />
      <Courses />
      <Pricing />
      <CTA />
    </>
  );
}
