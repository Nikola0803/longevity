"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Floating "not sure what you need?" quiz launcher, shown site-wide.
 * Opens a lightweight teaser modal that deep-links into the full
 * interactive quiz at /quiz (app/quiz/page.tsx) rather than embedding
 * the flow inline here, the goal-picker -> subgoal -> results flow
 * needs more room than a popup card.
 */
export default function QuizPopup() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary-500 px-5 py-3 text-[13px] font-semibold text-background-900 shadow-[0_12px_30px_-8px_rgb(var(--primary-500) / 0.55)] transition-transform duration-300 ease-precision hover:scale-[1.04] cursor-pointer"
      >
        <i className="ri-questionnaire-line text-[15px]"></i>
        <span className="hidden sm:inline">Not sure what you need?</span>
        <span className="sm:hidden">Quiz</span>
        <i className="ri-arrow-right-line text-[14px]"></i>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-background-900/80 backdrop-blur-sm p-0 sm:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-background-200/60 bg-background-800 p-7"
            style={{ boxShadow: "0 40px 90px -30px rgba(0,0,0,0.65)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h3 className="font-display text-[18px] font-semibold text-foreground-100">
                Find your protocol
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-foreground-500 hover:text-foreground-100 text-xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>
            <p className="mt-3 text-[13px] text-foreground-400 leading-relaxed">
              Answer a couple of quick questions and we&#39;ll point you toward the right compound or stack. No pressure, no upsell.
            </p>

            <Link
              href="/quiz"
              onClick={() => setOpen(false)}
              className="mt-5 flex items-center justify-center h-11 rounded-md bg-primary-500 text-background-900 text-[13px] font-semibold hover:bg-primary-400 transition-all duration-300 ease-precision cursor-pointer"
            >
              Take the quiz →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
