"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Timeframe, timeframes } from "types/Timeframe";
import { isValidPositiveValue } from "lib/validation";

type FrequencySelectorProps = {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  watchedTimeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
};

export function FrequencySelector({
  register,
  errors,
  watchedTimeframe,
  onTimeframeChange,
}: FrequencySelectorProps) {
  return (
    <>
      <label className="zp-label">
        Frequency<span className="text-red-500">*</span>
      </label>

      <div className="flex justify-center gap-2 items-center">
        <p className="lg:flex-shrink-0">Repeat payment every</p>
        <input
          {...register("timeframeValue", {
            validate: (value) => {
              if (!isValidPositiveValue(parseInt(value))) {
                return "Please enter a positive value";
              }

              return undefined;
            },
          })}
          className="zp-input w-full"
        />
        <select
          {...register("timeframe")}
          className="select select-bordered"
          onChange={(event) =>
            onTimeframeChange(event.target.value as Timeframe)
          }
          value={watchedTimeframe}
        >
          {timeframes.map((timeframe) => (
            <option key={timeframe} value={timeframe}>
              {timeframe}
            </option>
          ))}
        </select>
      </div>
      {errors.timeframeValue && (
        <p className="zp-form-error">
          {errors.timeframeValue.message as string}
        </p>
      )}
    </>
  );
}
