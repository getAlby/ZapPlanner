"use client";
import Link from "next/link";
import { Box } from "app/components/Box";
import { Button } from "app/components/Button";
import { useForm } from "react-hook-form";
import React from "react";
import { Loading } from "app/components/Loading";
import clsx from "clsx";
import { emailRegex, isValidEmail } from "lib/validation";
import { UpdateSubscriptionRequest } from "types/UpdateSubscriptionRequest";
import toast from "react-hot-toast";

type SubscriptionPageFormProps = {
  beforeFormContent: React.ReactNode;
  formFields: SubscriptionFormData;
  subscriptionId: string;
  emailNotificationsSupported: boolean;
};

type SubscriptionFormData = UpdateSubscriptionRequest;

export function SubscriptionPageForm({
  beforeFormContent,
  formFields,
  subscriptionId,
  emailNotificationsSupported,
}: SubscriptionPageFormProps) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    watch,
  } = useForm<SubscriptionFormData>({
    defaultValues: formFields,
  });

  const watchedEmail = watch("email");

  const onSubmit = handleSubmit((data) =>
    updateSubscription(subscriptionId, data)
  );

  return (
    <form onSubmit={onSubmit} className="flex flex-col w-full items-center">
      <Box>
        {beforeFormContent}

        <div className="flex flex-col -mt-8">
          <label className="zp-label">Email (Optional)</label>
          <input
            {...register("email", {
              pattern: {
                value: emailRegex,
                message: "Invalid email address",
              },
              validate: (value) =>
                !value && value === formFields.email
                  ? "Please enter an email"
                  : undefined,
            })}
            type="email"
            className={"zp-input"}
          />
          {errors.email && (
            <p className="zp-form-error">{errors.email.message}</p>
          )}
          {emailNotificationsSupported ? (
            <label className="label cursor-pointer mt-6 p-0 flex gap-2 items-center justify-start">
              <input
                {...register("sendPaymentNotifications")}
                type="checkbox"
                className={clsx(
                  "checkbox checkbox-sm",
                  isValidEmail(watchedEmail) && "checkbox-warning"
                )}
                disabled={!isValidEmail(watchedEmail)}
              />
              <span
                className={clsx(
                  "font-body text-sm font-medium",
                  !isValidEmail(watchedEmail) && "text-gray-300"
                )}
              >
                I want to receive email confirmation for every payment
              </span>
            </label>
          ) : (
            <span className={clsx("font-body text-xs text-gray-300 mt-2")}>
              Email confirmations for individual payments are only supported for
              timeframes of 1 hour or more.
            </span>
          )}
        </div>
      </Box>
      <div className="mt-8 flex gap-4 flex-wrap items-center justify-center">
        <Link href="/create">
          <Button type="button" variant="secondary">
            New Periodic Payment
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          <div className="flex justify-center items-center gap-2">
            <span>Save</span>
            {isSubmitting && <Loading />}
          </div>
        </Button>
      </div>
    </form>
  );
}
async function updateSubscription(
  subscriptionId: string,
  data: SubscriptionFormData
) {
  const res = await fetch(`/api/subscriptions/${subscriptionId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    toast.error(res.status + " " + res.statusText);
    return false;
  } else {
    toast.success("Email settings updated");
  }
}
