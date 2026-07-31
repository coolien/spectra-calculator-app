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

      {learnCategories.map((category, index) => (
        <section key={category.id} className="learn-cat" data-accent={index % 4}>
          <div className="learn-cat-head">
            <span className="learn-cat-icon" aria-hidden="true">{category.icon}</span>
            <div>
              <h2>{category.title}</h2>
              <p>{category.intro}</p>
            </div>
          </div>

          <ul className="learn-cards">
            {category.lessons.map((lesson) => (
              <li key={lesson.id}>
                <Link href={`/learn/${lesson.id}`}>
                  <span className="learn-card-mark" aria-hidden="true">{lesson.term.slice(0, 1)}</span>
                  <span className="learn-card-text">
                    <strong>{lesson.term}</strong>
                    <small>{lesson.oneLiner}</small>
                  </span>
                  <span className="learn-card-go" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </ContentPage>
  );
}
