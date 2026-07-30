import content from '@/lib/finance/learn-content.json' with { type: 'json' };
import type { CalculatorKey } from '@/lib/calculators';

export type LearnCategory = (typeof content.categories)[number];
export type Lesson = LearnCategory['lessons'][number];

/**
 * Lessons whose article has been written out in full (Stage 2 of the AdSense
 * recovery plan). Only these are offered to search engines — a short glossary
 * card published as its own URL is thin content, and 18 thin pages read worse
 * to a reviewer than 2 good ones. Add a slug here once its article is written.
 * See docs/ADSENSE_RECOVERY_PLAN.md.
 */
export const EXPANDED_LESSONS = new Set<string>([]);

export function isExpanded(id: string): boolean {
  return EXPANDED_LESSONS.has(id);
}

export const learnMeta = content.meta;
export const learnCategories: LearnCategory[] = content.categories;

export function allLessons(): Array<{ lesson: Lesson; category: LearnCategory }> {
  return content.categories.flatMap((category) => category.lessons.map((lesson) => ({ lesson, category })));
}

export function findLesson(id: string) {
  return allLessons().find((entry) => entry.lesson.id === id);
}

/** Which calculator answers this lesson's question, where one does. */
export const CALCULATOR_FOR_LESSON: Partial<Record<string, CalculatorKey>> = {
  eir: 'car',
  'flat-vs-reducing': 'personal',
  dsr: 'home',
  'credit-card': 'credit',
  bnpl: 'credit',
};
