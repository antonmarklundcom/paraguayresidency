import Link from 'next/link';

export function Agents() {
  return (
    <section id="agents" aria-labelledby="agents-title" className="ipm-agents">
      <div className="ipm-wrap">
        <h2 id="agents-title" className="ipm-sec" style={{ margin: 0, fontWeight: 400 }}>§ 05 · For agents and family offices</h2>
        <div className="ipm-col">
          <h3>Migration agents</h3>
          <p>Refer a client and keep the relationship. We handle the filing in Asunción and report to you in writing at each stage. Referral terms are agreed in writing up front. <Link href="/investor-pass/for-agents">How referrals work</Link>.</p>
        </div>
        <div className="ipm-col">
          <h3>Family offices</h3>
          <p>Several principals or family members, one coordinated plan. Each person gets their own written file on route, documents and exit, so advisers can review it line by line.</p>
        </div>
        <a href="#qualify" className="ipm-btn ipm-btn-onDark">Write to us</a>
      </div>
    </section>
  );
}
