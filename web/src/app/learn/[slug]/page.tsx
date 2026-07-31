import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ContentPage } from '@/components/content/ContentPage';
import { allLessons, findLesson, isExpanded, CALCULATOR_FOR_LESSON, learnMeta } from '@/lib/learn';
import { SITE_URL, SITE_NAME } from '@/lib/site';

export function generateStaticParams() {
  return allLessons().map(({ lesson }) => ({ slug: lesson.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = findLesson(slug);
  if (!entry) return {};
  const { lesson } = entry;

  return {
    title: `${lesson.term} — ${lesson.oneLiner}`,
    description: lesson.body.slice(0, 155),
    keywords: lesson.keywords,
    alternates: { canonical: `${SITE_URL}/learn/${lesson.id}` },
    // A short glossary card is thin content. Until its full article is written
    // (Stage 2), keep it out of the index rather than publishing 18 thin URLs.
    ...(isExpanded(lesson.id) ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = findLesson(slug);
  if (!entry) notFound();
  const { lesson, category } = entry;
  const calculator = CALCULATOR_FOR_LESSON[lesson.id];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: lesson.term,
    description: lesson.oneLiner,
    articleSection: category.title,
    inLanguage: 'en-MY',
    dateModified: learnMeta.lastVerified,
    publisher: { '@type': 'Organization', name: SITE_NAME },
    mainEntityOfPage: `${SITE_URL}/learn/${lesson.id}`,
  };

  return (
    <ContentPage
      title={lesson.term}
      intro={lesson.oneLiner}
      breadcrumb={{ href: '/learn', label: `← ${category.title}` }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <p className="lesson-body">{lesson.body}</p>

      <div className="lesson-callouts">
        <section className="lesson-callout tone-why">
          <span className="lesson-callout-icon" aria-hidden="true">◈</span>
          <div>
            <h2>Why it matters</h2>
            <p>{lesson.whyItMatters}</p>
          </div>
        </section>

        <section className="lesson-callout tone-tip">
          <span className="lesson-callout-icon" aria-hidden="true">◎</span>
          <div>
            <h2>Quick tip</h2>
            <p>{lesson.quickTip}</p>
          </div>
        </section>
      </div>

      {lesson.keywords.length > 0 && (
        <ul className="lesson-tags" aria-label="Related terms">
          {lesson.keywords.map((keyword) => <li key={keyword}>{keyword}</li>)}
        </ul>
      )}

      {calculator && (
        <Link href="/" className="lesson-cta">
          <span>Work this out with your own numbers</span>
          <span aria-hidden="true">→</span>
        </Link>
      )}

      <p className="content-meta">Last reviewed {learnMeta.lastVerified} · {learnMeta.jurisdiction}</p>
    </ContentPage>
  );
}
