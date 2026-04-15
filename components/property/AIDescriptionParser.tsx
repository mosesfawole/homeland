"use client";
import { useEffect, useState } from "react";
import { UseFormSetValue } from "react-hook-form";
import { Sparkles, Loader2, AlertCircle, CheckCircle2, X } from "lucide-react";
import { useAIParser } from "@/hooks/useAIParser";
import {
  LISTING_TYPES,
  PROPERTY_TYPES,
  RENT_DURATIONS,
  type ListingType,
  type PropertyType,
  type RentDuration,
} from "@/lib/db-types";
import type { PropertyFormValues } from "@/lib/validations/property";

interface Props {
  // We pass setValue from the parent form so AI can populate fields directly
  setValue: UseFormSetValue<PropertyFormValues>;
  description: string;
  onParsed?: () => void; // optional callback after successful parse
}

export default function AIDescriptionParser({
  setValue,
  description,
  onParsed,
}: Props) {
  const [success, setSuccess] = useState(false);
  const { parse, isLoading, error, clearError } = useAIParser();

  useEffect(() => {
    if (error) clearError();
    if (success) setSuccess(false);
    // Only reset when the description changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [description]);

  const handleAutofill = async () => {
    const trimmed = description.trim();
    if (!trimmed) return;

    setSuccess(false);
    const result = await parse(trimmed);
    if (!result) return;

    const propertyType = PROPERTY_TYPES.find(
      (value) => value === result.propertyType,
    );
    const listingType = LISTING_TYPES.find(
      (value) => value === result.listingType,
    );
    const rentDurationValue = result.rentDuration?.toUpperCase();
    const rentDuration = RENT_DURATIONS.find(
      (value) => value === rentDurationValue,
    );

    // Populate form fields with AI result
    // Only set fields that were actually extracted (non-null)
    if (result.title) setValue("title", result.title, { shouldValidate: true });
    if (propertyType)
      setValue("propertyType", propertyType as PropertyType, {
        shouldValidate: true,
      });
    if (listingType)
      setValue("listingType", listingType as ListingType, {
        shouldValidate: true,
      });
    if (result.bedrooms !== null)
      setValue("bedrooms", result.bedrooms, { shouldValidate: true });
    if (result.bathrooms !== null)
      setValue("bathrooms", result.bathrooms, { shouldValidate: true });
    if (result.price !== null)
      setValue("price", result.price, { shouldValidate: true });
    if (rentDuration)
      setValue("rentDuration", rentDuration as RentDuration, {
        shouldValidate: true,
      });
    if (result.features?.length)
      setValue("features", result.features, { shouldValidate: true });
    if (result.location)
      setValue("address", result.location, { shouldValidate: true });

    // Handle location breakdown
    if (result.city) setValue("city", result.city);
    if (result.state) setValue("state", result.state);
    if (result.neighborhood) setValue("neighborhood", result.neighborhood);

    // Mark form as AI-populated for backend tracking
    setValue("aiParsed", true);
    setValue("aiRawInput", trimmed);

    setSuccess(true);
    onParsed?.();

    // Clear success message after 4 seconds
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <Sparkles size={15} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">AI Auto-fill</p>
          <p className="text-xs text-gray-500">
            Uses your full description above to fill the form.
          </p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span className="flex-1">{error}</span>
          <button onClick={clearError} className="shrink-0 hover:text-red-900">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Success state */}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
          <CheckCircle2 size={15} className="shrink-0" />
          <span>
            Form filled successfully. Review and edit any fields before
            submitting.
          </span>
        </div>
      )}

      {/* Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleAutofill}
          disabled={isLoading || !description.trim()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Analyzing description...
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Auto-fill with AI
            </>
          )}
        </button>
        {!description.trim() ? (
          <span className="text-xs text-gray-500">
            Add a description to enable parsing.
          </span>
        ) : null}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400">
        AI-extracted data may need correction. Always review before submitting.
      </p>
    </div>
  );
}
