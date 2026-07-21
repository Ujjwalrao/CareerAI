import React from 'react';
import { HelpCircle } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  id?: string;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  id
}: EmptyStateProps) {
  return (
    <div
      id={id}
      className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-hairline bg-paper-warm/50"
    >
      <HelpCircle size={28} className="text-mid-grey/60 mb-4 stroke-[1.25]" />
      <h3 className="font-heading text-lg text-ink tracking-tight font-medium mb-1">
        {title}
      </h3>
      <p className="font-sans text-[14px] text-mid-grey max-w-sm leading-relaxed mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="rounded-full border border-ink/10 bg-paper hover:bg-ink hover:text-paper hover:border-ink px-6 py-2 text-[13px] font-medium transition-all duration-200 cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
