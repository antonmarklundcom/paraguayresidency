import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import { Fact } from '@/components/Fact';
import { Button, Card, StatRow, Disclaimer } from '@/components';
import type { SiteKey } from '@/sites/registry';

/**
 * MDX is compiled at request time with next-mdx-remote/rsc (chosen over
 * @next/mdx so article bodies stay plain files, no route per file — recorded
 * in plan §9).
 */
/**
 * `site` is bound into `<Fact>` here rather than written into every MDX file:
 * an author writes `<Fact k="tax.territorial_rate" />` and the brand's locale
 * is applied for them (plan §4.11 — one facts file, never a second).
 */
function componentsFor(site: SiteKey) {
  return {
    Fact: (props: Omit<ComponentProps<typeof Fact>, 'site'>) => <Fact {...props} site={site} />,
    Button,
    Card,
    StatRow,
    Disclaimer,
    a: ({ href = '', ...props }: ComponentProps<'a'>) =>
      href.startsWith('/') ? <Link href={href} {...props} /> : <a href={href} rel="noopener" {...props} />,
  };
}

export function Mdx({ source, site }: { source: string; site: SiteKey }) {
  // These sources are repository-authored MDX. next-mdx-remote 6 otherwise
  // strips expression-valued props, including StatRow's literal stats array.
  // Keep its dangerous-JavaScript checks enabled while allowing those props.
  return (
    <MDXRemote
      source={source}
      components={componentsFor(site)}
      options={{ blockJS: false, blockDangerousJS: true }}
    />
  );
}
