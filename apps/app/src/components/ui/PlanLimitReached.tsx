"use client";

import { FEATURE_LABELS, type PlanFeature } from "@/lib/plan-config";

interface PlanLimitReachedProps {
  feature: PlanFeature;
  message?: string;
}

export function PlanLimitReached({ feature, message }: PlanLimitReachedProps) {
  const featureLabel = FEATURE_LABELS[feature] || feature;
  const defaultMessage = `${featureLabel} ist in Ihrem aktuellen Plan nicht verfügbar.`;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
        <svg
          className="h-6 w-6 text-amber-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-amber-900">
        Upgrade erforderlich
      </h3>
      <p className="mt-2 text-sm text-amber-700">
        {message || defaultMessage}
      </p>
      <p className="mt-1 text-sm text-amber-600">
        Upgraden Sie auf Professional, um diese Funktion freizuschalten.
      </p>
    </div>
  );
}

interface ObjektLimitReachedProps {
  currentCount: number;
  maxCount: number;
}

export function ObjektLimitReached({ currentCount, maxCount }: ObjektLimitReachedProps) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-amber-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-amber-800">
            Objekt-Limit erreicht ({currentCount}/{maxCount})
          </h3>
          <p className="mt-1 text-sm text-amber-700">
            Upgraden Sie auf Professional für unbegrenzte Objekte.
          </p>
        </div>
      </div>
    </div>
  );
}
