import type { Metadata } from 'next';
import { QuizCompleted } from '@/components/QuizCompleted';
import { QuizResultView, resolveResult } from '@/features/quiz/ResultView';
import { t } from '@/i18n';
import { siteMetadata } from '@/lib/metadata';
import { firstParam, type SearchParams } from '@/lib/conversion-pages';

const SITE = 'residenciaes' as const;

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: t(SITE, 'quiz.result.metaTitle'),
    description: t(SITE, 'quiz.result.metaDescription'),
    path: '/route-finder/result',
    noindex: true,
  });
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const { route, encoded, empty } = resolveResult({
    r: firstParam(params, 'r'),
    a: firstParam(params, 'a'),
  });
  return <>
    {!empty ? <QuizCompleted site={SITE} route={route} /> : null}
    <QuizResultView site={SITE} route={route} encoded={encoded} empty={empty} />
  </>;
}
