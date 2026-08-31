"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";
import { getProduct } from "@/lib/product-types";
import { useProducts } from "@/lib/products-context";
import {
  QUIZ_GOALS,
  QUIZ_SUBGOALS,
  QUIZ_PRODUCTS,
  QUIZ_LABELS,
  TIER_ORDER,
  MAX_GOALS,
  type Tier,
} from "@/data/quiz-content";

const STEPS = {
  GOALS: "goals",
  SUBGOAL: "subgoal",
  RESULTS: "results",
} as const;

type Step = (typeof STEPS)[keyof typeof STEPS];

function goalLabel(slug: string) {
  return QUIZ_GOALS.find((g) => g.slug === slug)?.label ?? slug;
}

interface Candidate {
  slug: string;
  tier: Tier;
  text: string;
}

function candidatesFor(key: string, exclude: Set<string>): Candidate[] {
  return Object.entries(QUIZ_PRODUCTS)
    .filter(([slug, p]) => p.variants[key] && !exclude.has(slug))
    .map(([slug, p]) => ({ slug, tier: p.tier, text: p.variants[key] }))
    .sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier]);
}

interface GoalResult {
  goalSlug: string;
  subgoalLabel?: string;
  picks: Candidate[];
}

function buildResults(selectedGoals: string[], subgoalAnswers: Record<string, string>): GoalResult[] {
  const used = new Set<string>();
  const results: GoalResult[] = [];

  selectedGoals.forEach((goalSlug) => {
    const subgoal = subgoalAnswers[goalSlug];
    const key = `${goalSlug}:${subgoal}`;
    const candidates = candidatesFor(key, used);
    const picks = candidates.slice(0, 2);
    picks.forEach((p) => used.add(p.slug));
    results.push({
      goalSlug,
      subgoalLabel: QUIZ_SUBGOALS[goalSlug]?.options.find((o) => o.slug === subgoal)?.label,
      picks,
    });
  });

  return results;
}

function ProductLine({ slug, text, badge }: { slug: string; text: string; badge: string }) {
  const products = useProducts();
  const product = getProduct(products, slug);
  if (!product) return null;
  return (
    <Link
      href={`/product/${slug}`}
      className="group block rounded-xl border border-background-200/60 bg-background-900/50 p-4 transition-colors hover:border-primary-500/40"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-11 w-11 shrink-0 rounded-lg overflow-hidden bg-background-200">
            <img src={product.image} alt="" className="h-full w-full object-cover object-top" />
          </div>
          <span className="font-display text-[14px] font-medium text-foreground-100 truncate group-hover:text-primary-500 transition-colors">
            {product.name}
          </span>
        </div>
        <span className="shrink-0 rounded-full bg-primary-500/15 px-2.5 py-1 font-mono text-[9.5px] tracking-wide text-primary-500 whitespace-nowrap">
          {badge}
        </span>
      </div>
      {text && <p className="mt-2.5 text-[12.5px] text-foreground-500 leading-relaxed">{text}</p>}
    </Link>
  );
}

export default function QuizPage() {
  const [step, setStep] = useState<Step>(STEPS.GOALS);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [subgoalIndex, setSubgoalIndex] = useState(0);
  const [subgoalAnswers, setSubgoalAnswers] = useState<Record<string, string>>({});

  const results = useMemo(() => {
    if (step !== STEPS.RESULTS) return null;
    return buildResults(selectedGoals, subgoalAnswers);
  }, [step, selectedGoals, subgoalAnswers]);

  function toggleGoal(slug: string) {
    setSelectedGoals((current) => {
      if (current.includes(slug)) return current.filter((g) => g !== slug);
      if (current.length >= MAX_GOALS) return current;
      return [...current, slug];
    });
  }

  function handleGoalsContinue() {
    if (selectedGoals.length === 0) return;
    setSubgoalIndex(0);
    setSubgoalAnswers({});
    setStep(STEPS.SUBGOAL);
  }

  function answerSubgoal(subgoalSlug: string) {
    const goalSlug = selectedGoals[subgoalIndex];
    const nextAnswers = { ...subgoalAnswers, [goalSlug]: subgoalSlug };
    setSubgoalAnswers(nextAnswers);
    if (subgoalIndex + 1 < selectedGoals.length) {
      setSubgoalIndex(subgoalIndex + 1);
    } else {
      setStep(STEPS.RESULTS);
    }
  }

  function goBack() {
    if (step === STEPS.SUBGOAL) {
      if (subgoalIndex > 0) {
        setSubgoalIndex(subgoalIndex - 1);
      } else {
        setStep(STEPS.GOALS);
      }
    } else if (step === STEPS.RESULTS) {
      setSubgoalIndex(selectedGoals.length - 1);
      setStep(STEPS.SUBGOAL);
    }
  }

  function retake() {
    setStep(STEPS.GOALS);
    setSelectedGoals([]);
    setSubgoalIndex(0);
    setSubgoalAnswers({});
  }

  return (
    <div className="min-h-screen bg-background-800 text-foreground-100">
      <PromoBanner />
      <Header />
      <main>
        {/* Hero */}
        <section className="relative pt-[112px] bg-background-900 border-b border-background-200/60 overflow-hidden">
          <div className="absolute inset-0 grid-overlay opacity-20 pointer-events-none"></div>
          <div className="absolute top-10 right-0 w-96 h-96 rounded-full bg-primary-500/5 blur-[140px] pointer-events-none"></div>
          <div className="relative w-full max-w-[1440px] mx-auto px-6 md:px-10 py-16 md:py-20">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-px bg-primary-500/60"></span>
              <span className="font-mono text-[10px] tracking-[0.28em] text-primary-500 uppercase">Quiz</span>
            </div>
            <h1 className="font-display text-[36px] md:text-[52px] leading-[0.95] tracking-tightest text-foreground-100 mb-4 max-w-2xl">
              Find your protocol in under a minute.
            </h1>
            <p className="text-[14px] text-foreground-400 max-w-lg leading-relaxed">
              A couple of quick questions, then a short list of research-first starting points, chosen from what you tell us, not a generic bestseller list.
            </p>
          </div>
        </section>

        {/* Quiz body */}
        <section className="bg-background-800 py-16 md:py-24">
          <div className="mx-auto max-w-2xl px-6 md:px-8">
            <div className="rounded-2xl border border-background-200/60 bg-background-900/50 p-6 md:p-10">
              {step === STEPS.GOALS && (
                <div>
                  <h2 className="font-display text-[20px] md:text-[24px] font-semibold text-foreground-100">
                    What&#39;s your main research focus?
                  </h2>
                  <p className="mt-2 text-[13px] text-foreground-500">Pick up to {MAX_GOALS}.</p>

                  <div className="mt-6 grid sm:grid-cols-2 gap-3">
                    {QUIZ_GOALS.map((goal) => {
                      const active = selectedGoals.includes(goal.slug);
                      const disabled = !active && selectedGoals.length >= MAX_GOALS;
                      return (
                        <button
                          key={goal.slug}
                          type="button"
                          onClick={() => toggleGoal(goal.slug)}
                          disabled={disabled}
                          className={`rounded-xl border px-4 py-3.5 text-left text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                            active
                              ? "border-primary-500 bg-primary-500/10 text-foreground-100"
                              : "border-background-200/60 bg-background-100/40 text-foreground-400 hover:border-background-300"
                          }`}
                        >
                          {goal.label}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleGoalsContinue}
                    disabled={selectedGoals.length === 0}
                    className="mt-8 w-full h-12 rounded-md bg-primary-500 text-background-900 text-[13px] font-semibold hover:bg-primary-400 transition-all duration-300 ease-precision disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Continue →
                  </button>
                </div>
              )}

              {step === STEPS.SUBGOAL &&
                (() => {
                  const goalSlug = selectedGoals[subgoalIndex];
                  const config = QUIZ_SUBGOALS[goalSlug];
                  if (!config) return null;
                  return (
                    <div>
                      <button
                        type="button"
                        onClick={goBack}
                        className="mb-4 inline-flex items-center gap-1.5 font-mono text-[11px] text-foreground-500 hover:text-primary-500 transition-colors cursor-pointer"
                      >
                        <i className="ri-arrow-left-line text-[13px]"></i>Back
                      </button>
                      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-primary-500">
                        {goalLabel(goalSlug)} · {subgoalIndex + 1} of {selectedGoals.length}
                      </p>
                      <h2 className="mt-3 font-display text-[20px] md:text-[24px] font-semibold text-foreground-100">
                        {config.question}
                      </h2>

                      <div className="mt-6 flex flex-col gap-3">
                        {config.options.map((opt) => (
                          <button
                            key={opt.slug}
                            type="button"
                            onClick={() => answerSubgoal(opt.slug)}
                            className="rounded-xl border border-background-200/60 bg-background-100/40 px-4 py-3.5 text-left text-[13px] font-medium text-foreground-400 transition-colors hover:border-primary-500/40 hover:text-foreground-100 cursor-pointer"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

              {step === STEPS.RESULTS && results && (
                <div>
                  <button
                    type="button"
                    onClick={goBack}
                    className="mb-4 inline-flex items-center gap-1.5 font-mono text-[11px] text-foreground-500 hover:text-primary-500 transition-colors cursor-pointer"
                  >
                    <i className="ri-arrow-left-line text-[13px]"></i>Back
                  </button>
                  <h2 className="font-display text-[20px] md:text-[24px] font-semibold text-foreground-100">
                    {QUIZ_LABELS.pageHeader}
                  </h2>
                  <p className="mt-2 text-[13px] text-foreground-500">{QUIZ_LABELS.pageSubheader}</p>

                  <div className="mt-8 space-y-8">
                    {results.map((goal) =>
                      goal.picks.length > 0 ? (
                        <div key={goal.goalSlug}>
                          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground-500 mb-3">
                            {goalLabel(goal.goalSlug)} · {goal.subgoalLabel}
                          </p>
                          <div className="space-y-3">
                            {goal.picks.map((pick, i) => (
                              <ProductLine
                                key={pick.slug}
                                slug={pick.slug}
                                text={pick.text}
                                badge={i === 0 ? QUIZ_LABELS.startHere : QUIZ_LABELS.alsoWorthLook}
                              />
                            ))}
                          </div>
                        </div>
                      ) : null
                    )}
                  </div>

                  <p className="mt-10 text-[11px] text-foreground-500 leading-relaxed border-t border-background-200/50 pt-6">
                    {QUIZ_LABELS.footer}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={retake}
                      className="h-10 px-5 rounded-md border border-background-200/60 text-[13px] font-medium text-foreground-300 hover:border-primary-500/40 hover:text-foreground-100 transition-colors cursor-pointer"
                    >
                      Retake the quiz
                    </button>
                    <Link
                      href="/shop"
                      className="h-10 px-5 rounded-md bg-primary-500 text-background-900 text-[13px] font-semibold hover:bg-primary-400 transition-all duration-300 ease-precision inline-flex items-center cursor-pointer"
                    >
                      Browse full shop →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <p className="mt-6 text-center text-[10px] italic text-foreground-600">
              *For Research Use Only. Not intended for human consumption.*
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
