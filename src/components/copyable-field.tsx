"use client";

import { useState } from "react";
import clsx from "clsx";

export function CopyableField({
  label,
  value,
  monospace,
}: {
  label: string;
  value: string;
  monospace?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <div className="text-[11px] text-cc-foreground-500 mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <div
          className={clsx(
            "flex-1 min-w-0 truncate rounded-md border border-cc-background-300 bg-cc-background-100 px-2.5 py-1.5 text-xs text-cc-foreground-800",
            monospace && "font-mono"
          )}
        >
          {value}
        </div>
        <button
          onClick={handleCopy}
          className="text-xs border border-cc-background-300 rounded-md px-2.5 py-1.5 text-cc-foreground-700 hover:bg-cc-background-100 whitespace-nowrap"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
