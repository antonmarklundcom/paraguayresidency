import { Button, Container } from '@/components';
import { NotFoundBody } from '@/lib/not-found-body';

// GuideLayout supplies the brand shell, including navigation and footer.
export default function NotFound() {
  return (
    <>
      <NotFoundBody site="guide" />
      <Container width="narrow" className="pb-[var(--space-12)]">
        <Button href="/members">Back to your modules</Button>
      </Container>
    </>
  );
}
