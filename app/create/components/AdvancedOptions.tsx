"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { useState } from "react";

type AdvancedOptionsProps = {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  useCron: boolean;
};

export function AdvancedOptions({
  register,
  errors,
  useCron,
}: AdvancedOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-primary font-medium hover:underline focus:outline-none"
        >
          <span>{isOpen ? "▼" : "▶"}</span>
          <span>Advanced options</span>
        </button>
      </div>

      {isOpen && (
        <>
          {/* Cron Expression Toggle */}
          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="useCron"
              {...register("useCron")}
              className="checkbox"
            />
            <label className="label-text" htmlFor="useCron">
              Use cron expression
            </label>
          </div>

          {useCron && (
            <div className="space-y-2">
              <label className="zp-label">Cron Expression</label>
              <input
                key="cronExpression"
                {...register("cronExpression", {
                  validate: (value) => {
                    if (!value) return "Cron expression is required";
                    const parts = value.split(" ");
                    if (parts.length !== 5) {
                      return "Cron expression must have 5 parts (minute hour day month weekday)";
                    }
                    if (
                      process.env.NEXT_PUBLIC_ALLOW_SHORT_TIMEFRAMES !==
                        "true" &&
                      !/^[0-5]?[0-9] /.test(value)
                    ) {
                      return "Cron expression must repeat only once per hour";
                    }
                  },
                })}
                className="zp-input"
                placeholder="0 10 * * 0 (Every Sunday at 10:00 AM UTC)"
              />
              {errors.cronExpression && (
                <p className="zp-form-error">
                  {errors.cronExpression.message as string}
                </p>
              )}
              <div className="text-sm text-gray-600">
                <p>Examples:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <code>0 10 * * 0</code> - Every Sunday at 10:00 AM UTC
                  </li>
                  <li>
                    <code>0 23 * * 0</code> - Every Sunday at 11:00 PM UTC
                  </li>
                  <li>
                    <code>0 9 * * 1</code> - Every Monday at 9:00 AM UTC
                  </li>
                  <li>
                    <code>0 12 * * *</code> - Every day at 12:00 PM UTC
                  </li>
                  <li>
                    <code>0 0 1 * *</code> - First day of every month at
                    midnight UTC
                  </li>
                  <li>
                    <code>0 0 * * 1#1</code> - First Monday of every month at
                    midnight UTC
                  </li>
                </ul>
                <p className="mt-2">
                  <a
                    href="https://crontab.guru/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    📅 Use crontab.guru for help
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* Max Payments */}
          <label className="zp-label">
            Maximum number of payments (Optional)
          </label>
          <input
            {...register("maxPayments", {
              validate: (value) => {
                if (!value) return undefined;
                if (!Number.isInteger(Number(value))) {
                  return "Please enter a whole number";
                }
                if (Number(value) <= 0) {
                  return "Please enter a positive number";
                }
                return undefined;
              },
            })}
            type="number"
            min="1"
            className="zp-input"
            placeholder="e.g., 12 (leave empty for unlimited)"
          />
          {errors.maxPayments && (
            <p className="zp-form-error">
              {errors.maxPayments.message as string}
            </p>
          )}

          {/* End DateTime */}
          <label className="zp-label">End date and time (Optional)</label>
          <input
            {...register("endDateTime", {
              validate: (value) => {
                if (!value) return undefined;
                if (new Date(value) <= new Date()) {
                  return "End date must be in the future";
                }
                return undefined;
              },
            })}
            type="datetime-local"
            className="zp-input"
            min={new Date().toISOString().slice(0, 16)}
            placeholder="Leave empty for unlimited payments"
          />
          {errors.endDateTime && (
            <p className="zp-form-error">
              {errors.endDateTime.message as string}
            </p>
          )}
        </>
      )}
    </>
  );
}
