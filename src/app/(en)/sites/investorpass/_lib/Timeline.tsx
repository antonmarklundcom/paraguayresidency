import { Fact } from '@/components';

interface Stage {
  label: string;
  fx: number;
  hm: number;
  tone: 'plain' | 'held' | 'pass';
}

const STANDARD: Stage[] = [
  { label: 'Temporary application', fx: 1.1, hm: 56, tone: 'plain' },
  { label: 'Temporary residency held before you may apply for permanent status', fx: 5.4, hm: 160, tone: 'held' },
  { label: 'Permanent application', fx: 1.3, hm: 56, tone: 'plain' },
];

const PASS: Stage[] = [
  { label: 'Investment structured', fx: 1.2, hm: 56, tone: 'pass' },
  { label: 'Pass application filed and processed', fx: 1.5, hm: 72, tone: 'pass' },
];

function Track({ title, sub, stages, pass = false }: { title: string; sub: string; stages: Stage[]; pass?: boolean }) {
  return (
    <div className={`ipm-track${pass ? ' ipm-track-pass' : ''}`}>
      <div>
        <h3>{title}</h3>
        <p>{sub}</p>
      </div>
      <ol className="ipm-stages" aria-label={`${title}: ${sub}`}>
        {stages.map((stage) => (
          <li
            key={stage.label}
            className={`ipm-stage ipm-s-${stage.tone}`}
            style={{ '--fx': stage.fx, '--hm': `${stage.hm}px` } as React.CSSProperties}
          >
            {stage.label}
          </li>
        ))}
        <li className="ipm-stage ipm-stage-end">Permanent card</li>
        {pass && <li aria-hidden="true" className="ipm-stage ipm-stage-gap" style={{ '--fx': 5.1 } as React.CSSProperties} />}
      </ol>
    </div>
  );
}

/**
 * Standard route vs Investor Pass as two stage lists. Proportions are
 * illustrative and labelled so; durations are never drawn as numbers: the
 * Pass's own window is the sourced `investorpass.timeline` fact, printed below.
 */
export function Timeline() {
  return (
    <div className="ipm-tl">
      <Track title="Standard residency" sub="Temporary, then permanent" stages={STANDARD} />
      <Track title="Investor Pass" sub="Permanent, directly" stages={PASS} pass />
      <div className="ipm-tl-axis" aria-hidden="true">
        <span>Start</span>
        <span>Illustrative proportions · durations quoted in writing per case</span>
        <span>Time →</span>
      </div>
      <p className="ipm-tl-fact">
        <strong>Investor Pass processing, as currently published:</strong> <Fact k="investorpass.timeline" site="investorpass" />.
      </p>
    </div>
  );
}
