"use client";

import { useState } from "react";
import type { UseFormSetValue } from "react-hook-form";
import { Sparkles, Loader2 } from "lucide-react";
import {
  PROPERTY_TYPE_LABELS,
  type PropertyFormInput,
} from "@/lib/validations/property";
import { useAIParser } from "@/hooks/useAIParser";
import type { ParsedProperty } from "@/types";

interface Props {
  setValue: UseFormSetValue<PropertyFormInput>;
}

export default function AIDescriptionParser({ setValue }: Props) {
  const [description, setDescription] = useState("");
  const { parse, isLoading, error, clearError } = useAIParser();

  const propertyTypes = Object.keys(
    PROPERTY_TYPE_LABELS,
  ) as PropertyFormInput["propertyType"][];
  const listingTypes = ["RENT", "SALE"] as const;

  const isPropertyType = (
    value: string,
  ): value is PropertyFormInput["propertyType"] =>
    propertyTypes.includes(value as PropertyFormInput["propertyType"]);

  const isListingType = (
    value: string,
  ): value is PropertyFormInput["listingType"] =>
    listingTypes.includes(value as PropertyFormInput["listingType"]);

  const applyResult = (result: ParsedProperty | null) => {
    if (!result) return;

    setValue("title", result.title, { shouldDirty: true });
    if (isPropertyType(result.propertyType)) {
      setValue("propertyType", result.propertyType, { shouldDirty: true });
    }
    if (isListingType(result.listingType)) {
      setValue("listingType", result.listingType, { shouldDirty: true });
    }

    if (result.bedrooms !== null) {
      setValue("bedrooms", result.bedrooms, { shouldDirty: true });
    }
    if (result.bathrooms !== null) {
      setValue("bathrooms", result.bathrooms, { shouldDirty: true });
    }

    setValue("price", result.price, { shouldDirty: true });

    if (result.rentDuration) {
      setValue(
        "rentDuration",
        result.rentDuration === "year" ? "YEAR" : "MONTH",
        { shouldDirty: true },
      );
    }

    if (result.location) {
      setValue("address", result.location, { shouldDirty: true });
    }

    if (result.city) {
      setValue("city", result.city, { shouldDirty: true });
    }

    if (result.state) {
      setValue("state", result.state, { shouldDirty: true });
    }

    if (result.neighborhood) {
      setValue("neighborhood", result.neighborhood, { shouldDirty: true });
    }

    if (result.features?.length) {
      setValue("features", result.features, { shouldDirty: true });
    }

    setValue("aiParsed", true, { shouldDirty: true });
    setValue("aiRawInput", description, { shouldDirty: true });
  };

  const handleParse = async () => {
    clearError();
    if (!description.trim()) return;
    const result = await parse(description.trim());
    applyResult(result);
  };

  return (
    <section className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2 text-blue-700">
        <Sparkles size={16} />
        <h3 className="font-semibold text-sm">AI Auto-fill</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Paste property description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="e.g. 2 bedroom self contain apartment in Lekki Phase 1, fully furnished, 24hrs power..."
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-colors bg-white resize-none"
        />
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleParse}
        disabled={isLoading || !description.trim()}
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors"
      >
        {isLoading ? <Loader2 size={15} className="animate-spin" /> : null}
        {isLoading ? "Parsing..." : "Auto-fill with AI"}
      </button>
    </section>
  );
}

