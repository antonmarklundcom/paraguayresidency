'use client';

import { useActionState, useEffect, useLayoutEffect, useRef, type ComponentProps, type RefObject } from 'react';
import { LeadFormFields } from './LeadFormFields';
import { NewsletterFormFields } from './NewsletterFormFields';
import { MagicLinkFormFields } from './MagicLinkFormFields';
import { submitLeadAction, subscribeAction, magicLinkAction } from '@/app/actions/lead';
import { initialLeadState, type LeadFormState } from '@/app/actions/lead-state';

type ViewProps<T extends React.ElementType> = Omit<ComponentProps<T>, 'action' | 'state' | 'pending'>;
export type EnhancementProps =
  | { kind: 'lead'; fields: ViewProps<typeof LeadFormFields> }
  | { kind: 'newsletter'; fields: ViewProps<typeof NewsletterFormFields> }
  | { kind: 'magic'; fields: ViewProps<typeof MagicLinkFormFields> };
export interface FormSnapshot {
  values: { name: string; value: string }[];
  focus?: string;
  selection?: [number | null, number | null];
}

export default function FormEnhancement(props: EnhancementProps & { snapshot: RefObject<FormSnapshot> }) {
  const serverAction = props.kind === 'lead' ? submitLeadAction : props.kind === 'newsletter' ? subscribeAction : magicLinkAction;
  const [state, action, pending] = useActionState<LeadFormState, FormData>(serverAction, initialLeadState);
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const form = root.current?.querySelector('form');
    if (!form) return;
    const saved = { ...props.snapshot.current };
    for (const { name, value } of saved.values) {
      const field = form.elements.namedItem(name);
      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) field.value = value;
    }
    const focus = form.elements.namedItem(saved.focus ?? '');
    if (focus instanceof HTMLElement) focus.focus({ preventScroll: true });
    if ((focus instanceof HTMLInputElement || focus instanceof HTMLTextAreaElement) && saved.selection) {
      focus.setSelectionRange(...saved.selection);
    }
  }, [props.snapshot]);
  useEffect(() => {
    if (state.status !== 'ok') return;
    const url = new URL(window.location.href);
    url.searchParams.set(props.kind, 'ok');
    window.history.replaceState({}, '', url);
    const status = root.current?.querySelector<HTMLElement>('[role="status"]');
    if (status) { status.tabIndex = -1; status.focus(); }
  }, [state.status, props.kind]);
  return <div ref={root} data-enhanced>
    {props.kind === 'lead' ? <LeadFormFields {...props.fields} action={action} state={state} pending={pending} />
      : props.kind === 'newsletter' ? <NewsletterFormFields {...props.fields} action={action} state={state} pending={pending} />
        : <MagicLinkFormFields {...props.fields} action={action} state={state} pending={pending} />}
  </div>;
}
