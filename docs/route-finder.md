# Route Finder — scoring, and the three documented outcomes

The Route Finder (plan §3, §5.2.3) is the strongest cross-brand link: the same
six questions run on all three domains, and the result deep-links to whichever
brand owns the recommended route.

Scoring lives in `src/features/quiz/scoring.ts` and is a pure function — no
i18n, no database, no request. Question and answer *copy* lives in
`src/i18n/messages/en/common.json` under `quiz.*`; only ids and weights live in
the scoring module. Sonnet phases must not edit `scoring.ts` (plan §6).

## Nothing here is a legal claim

The weights express **fit** — which route is worth talking about first — not
what the law says. Every figure on the result page renders through `<Fact>` and
stays hedged until Anton's legal partner verifies it (plan §1.10). The capital
question deliberately asks for bands ("a moderate amount"), never thresholds,
because the public sources disagree on the Investor Pass minimum.

## How a route is chosen

Each answer adds points to one or more routes. The highest total wins. On a tie
— and when nothing has been answered — the order is `temporary`, then
`permanent`, then `investor-pass`: the lowest-commitment route wins by default
and the Investor Pass has to be earned outright.

| Question | Option | temporary | permanent | investor-pass |
|---|---|---|---|---|
| nationality | mercosur | | 1 | |
| | eu / us_ca / other | | | |
| goal | relocate | 2 | 1 | |
| | base | | 3 | |
| | invest | | | 4 |
| timeline | asap | | 1 | 2 |
| | year | 2 | | |
| | exploring | 1 | | |
| capital | under_50k | 2 | | |
| | band_50k_150k | | 1 | 1 |
| | over_150k | | | 3 |
| family | alone | | | |
| | partner | 1 | | |
| | family | 1 | 1 | |
| tax | yes | | 2 | |
| | no | | | |
| | unsure | 1 | | |

## The three documented answer sets

These are the sets asserted in `tests/quiz-scoring.test.ts`. Changing a weight
without updating both is a failing build.

**→ temporary residency** (7 / 1 / 0)

```
nationality=other  goal=relocate  timeline=year
capital=under_50k  family=partner  tax=no
```

**→ permanent residency** (1 / 9 / 3)

```
nationality=mercosur  goal=base  timeline=asap
capital=band_50k_150k  family=family  tax=yes
```

**→ Investor Pass** (0 / 3 / 9)

```
nationality=us_ca  goal=invest  timeline=asap
capital=over_150k  family=alone  tax=yes
```

## The result URL

`/route-finder/result?r=<route>&a=nationality:other,goal:relocate,…`

`a` is the answer set; `r` is a convenience for sharing the link and is
**never trusted**. The server re-scores `a` on every request, so editing `r` by
hand cannot make the page recommend something the answers do not support. `r`
is used only when `a` carries no readable answers at all.

Submitting the form on the result page stores the route in `leads.quiz_result`
and the answers in `leads.quiz_answers`, and sends both to the CRM timeline.
