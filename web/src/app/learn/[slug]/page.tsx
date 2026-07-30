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

      <p>{lesson.body}</p>

      <section className="content-callout">
        <h2>Why it matters</h2>
        <p>{lesson.whyItMatters}</p>
      </section>

      <section className="content-callout">
        <h2>Quick tip</h2>
        <p>{lesson.quickTip}</p>
      </section>

      {calculator && (
        <p className="content-action">
          <Link href="/">Work this out with your own numbers →</Link>
        </p>
      )}

      <p className="content-meta">Last reviewed {learnMeta.lastVerified} · {learnMeta.jurisdiction}</p>
    </ContentPage>
  );
}
