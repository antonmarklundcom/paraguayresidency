import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { Fact } from '@/components/Fact';
import { Button, Card } from '@/components';

/**
 * MDX is compiled at request time with next-mdx-remote/rsc (chosen over
 * @next/mdx so article bodies stay plain files, no route per file — recorded
 * in plan §9).
 */
const components = {
  Fact,
  Button,
  Card,
  a: ({ href = '', ...props }: React.ComponentProps<'a'>) =>
    href.startsWith('/') ? <Link href={href} {...props} /> : <a href={href} rel="noopener" {...props} />,
};

export function Mdx({ source }: { source: string }) {
  return <MDXRemote source={source} components={components} />;
}
