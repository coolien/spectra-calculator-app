import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentPage } from '@/components/content/ContentPage';
import { learnCategories, learnMeta } from '@/lib/learn';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Learn — Malaysian money basics in plain language',
  description:
    'Plain-language lessons on Malaysian personal finance: CCRIS and credit records, flat vs reducing rates, EIR, DSR, income tax relief, EPF and protection.',
  alternates: { canonical: `${SITE_URL}/learn` },
};

export default function LearnIndex() {
  const total = learnCategories.reduce((count, category) => count + category.lessons.length, 0);

  return (
    <ContentPage
      title="Learn"
      intro="Money basics in plain language — the things school never taught. Written for Malaysia, with the rules that actually apply here."
    >
      <p className="content-meta">
        {total} lessons · last reviewed {learnMeta.lastVerified}
      </p>

      {learnCategories.map((category) => (
        <section key={category.id} className="content-section">
          <h2>{category.title}</h2>
          <p>{category.intro}</p>
          <ul className="content-list">
            {category.lessons.map((lesson) => (
              <li key={lesson.id}>
                <Link href={`/learn/${lesson.id}`}>{lesson.term}</Link>
                <span>{lesson.oneLiner}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </ContentPage>
  );
}
