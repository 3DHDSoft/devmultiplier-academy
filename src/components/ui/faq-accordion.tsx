'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  className?: string;
}

export function FAQAccordion({ items, className }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={cn('divide-y divide-[#d1d9e0] rounded-md border border-[#d1d9e0] dark:divide-[#30363d] dark:border-[#30363d]', className)}>
      {items.map((item, index) => (
        <div key={index} className="bg-white dark:bg-[#161b22]">
          <button onClick={() => toggleItem(index)} className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]" aria-expanded={openIndex === index}>
            <span className="pr-4 font-medium text-[#1f2328] dark:text-[#e6edf3]">{item.question}</span>
            <ChevronDown className={cn('h-5 w-5 shrink-0 text-[#656d76] transition-transform duration-200 dark:text-[#848d97]', openIndex === index && 'rotate-180')} />
          </button>
          <div className={cn('overflow-hidden transition-all duration-200', openIndex === index ? 'max-h-96' : 'max-h-0')}>
            <div className="border-t border-[#d1d9e0] px-6 py-4 dark:border-[#30363d]">
              <p className="text-[#656d76] dark:text-[#848d97]">{item.answer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface FAQSectionProps {
  title?: string;
  items: FAQItem[];
  className?: string;
}

export function FAQSection({ title = 'Frequently Asked Questions', items, className }: FAQSectionProps) {
  return (
    <section className={cn('py-12', className)}>
      <h2 className="mb-8 text-2xl font-semibold text-[#1f2328] dark:text-[#e6edf3]">{title}</h2>
      <FAQAccordion items={items} />
    </section>
  );
}

export default FAQAccordion;
