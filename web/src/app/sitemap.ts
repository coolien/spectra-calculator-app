import type { MetadataRoute } from 'next';
import { allLessons, isExpanded, learnMeta } from '@/lib/learn';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(learnMeta.lastVerified);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/learn`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE_URL}/legal`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Only list lessons whose full article exists. Submitting thin pages invites
  // the same "low value content" verdict. See docs/ADSENSE_RECOVERY_PLAN.md.
  const lessonRoutes: MetadataRoute.Sitemap = allLessons()
    .filter(({ lesson }) => isExpanded(lesson.id))
    .map(({ lesson }) => ({
      url: `${SITE_URL}/learn/${lesson.id}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  return [...staticRoutes, ...lessonRoutes];
}
