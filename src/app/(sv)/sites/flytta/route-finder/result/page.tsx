import type { Metadata } from 'next';
import { QuizResultView, resolveResult } from '@/features/quiz/ResultView';
import { t } from '@/i18n';
import { siteMetadata } from '@/lib/metadata';
import { firstParam, type SearchParams } from '@/lib/conversion-pages';

const SITE = 'flytta' as const;

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
  return <QuizResultView site={SITE} route={route} encoded={encoded} empty={empty} />;
}
