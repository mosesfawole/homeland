"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import {
  propertySchema,
  type PropertyFormInput,
  PROPERTY_TYPE_LABELS,
  NIGERIAN_STATES,
  COMMON_FEATURES,
} from "@/lib/validations/property";
import AIDescriptionParser from "@/components/property/AIDescriptionParser";

interface Props {
  defaultValues?: Partial<PropertyFormInput>;
  propertyId?: string; // if editing existing
  mode?: "create" | "edit";
}

export default function PropertyForm({
  defaultValues,
  propertyId,
  mode = "create",
}: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [customFeature, setCustomFeature] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormInput>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      features: [],
      listingType: "RENT",
      bedrooms: 1,
      aiParsed: false,
      ...defaultValues,
    },
  });

  const listingType = watch("listingType");
  const selectedFeatures = watch("features") ?? [];

  const toggleFeature = (feature: string) => {
    const current = selectedFeatures;
    if (current.includes(feature)) {
      setValue(
        "features",
        current.filter((f) => f !== feature),
      );
    } else {
      setValue("features", [...current, feature]);
    }
  };

  const addCustomFeature = () => {
    const trimmed = customFeature.trim();
    if (!trimmed || selectedFeatures.includes(trimmed)) return;
    setValue("features", [...selectedFeatures, trimmed]);
    setCustomFeature("");
  };

  const onSubmit = async (data: PropertyFormInput) => {
    setServerError(null);
    try {
      const url =
        mode === "edit" && propertyId
          ? `/api/properties/${propertyId}`
          : "/api/properties";
      const method = mode === "edit" ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? "Failed to save listing");
        return;
      }

      router.push("/agent/listings");
      router.refresh();
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-colors bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
  const errorClass = "text-xs text-red-500 mt-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* ── AI Parser ──────────────────────────────────────────── */}
      <AIDescriptionParser setValue={setValue} />

      {/* ── Server error ───────────────────────────────────────── */}
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {serverError}
        </div>
      )}

      {/* ── Section: Basic Info ────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900">
          Basic Information
        </h2>

        {/* Title */}
        <div>
          <label className={labelClass}>Listing Title *</label>
          <input
            {...register("title")}
            placeholder="e.g. Modern 3 Bedroom Flat in Lekki Phase 1"
            className={inputClass}
          />
          {errors.title && <p className={errorClass}>{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Full Description *</label>
          <textarea
            {...register("description")}
            placeholder="Describe the property in detail..."
            rows={5}
            className={`${inputClass} resize-none`}
          />
          {errors.description && (
            <p className={errorClass}>{errors.description.message}</p>
          )}
        </div>

        {/* Property Type + Listing Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Property Type *</label>
            <select {...register("propertyType")} className={inputClass}>
              <option value="">Select type</option>
              {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {errors.propertyType && (
              <p className={errorClass}>{errors.propertyType.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Listing Type *</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {(["RENT", "SALE"] as const).map((type) => (
                <label
                  key={type}
                  className={`flex items-center justify-center py-2.5 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${
                    listingType === type
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    value={type}
                    {...register("listingType")}
                    className="sr-only"
                  />
                  {type === "RENT" ? "For Rent" : "For Sale"}
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Property Details ──────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900">
          Property Details
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Bedrooms *</label>
            <input
              type="number"
              min={0}
              {...register("bedrooms", { valueAsNumber: true })}
              className={inputClass}
            />
            {errors.bedrooms && (
              <p className={errorClass}>{errors.bedrooms.message}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Bathrooms</label>
            <input
              type="number"
              min={0}
              {...register("bathrooms", { valueAsNumber: true })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Toilets</label>
            <input
              type="number"
              min={0}
              {...register("toilets", { valueAsNumber: true })}
              className={inputClass}
            />
          </div>
        </div>

        {/* Price + Rent Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Price (₦) *</label>
            <input
              type="number"
              min={0}
              placeholder="e.g. 2000000"
              {...register("price", { valueAsNumber: true })}
              className={inputClass}
            />
            {errors.price && (
              <p className={errorClass}>{errors.price.message}</p>
            )}
          </div>

          {listingType === "RENT" && (
            <div>
              <label className={labelClass}>Rent Duration *</label>
              <select {...register("rentDuration")} className={inputClass}>
                <option value="YEAR">Per Year</option>
                <option value="MONTH">Per Month</option>
              </select>
            </div>
          )}
        </div>
      </section>

      {/* ── Section: Location ──────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900">Location</h2>

        <div>
          <label className={labelClass}>Full Address *</label>
          <input
            {...register("address")}
            placeholder="e.g. 14 Admiralty Way, Lekki Phase 1"
            className={inputClass}
          />
          {errors.address && (
            <p className={errorClass}>{errors.address.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>City *</label>
            <input
              {...register("city")}
              placeholder="e.g. Lagos"
              className={inputClass}
            />
            {errors.city && <p className={errorClass}>{errors.city.message}</p>}
          </div>
          <div>
            <label className={labelClass}>State *</label>
            <select {...register("state")} className={inputClass}>
              <option value="">Select state</option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.state && (
              <p className={errorClass}>{errors.state.message}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Neighborhood / Estate</label>
            <input
              {...register("neighborhood")}
              placeholder="e.g. Lekki Phase 1, GRA"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* ── Section: Features ──────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900">
          Features & Amenities
        </h2>

        {/* Common feature checkboxes */}
        <div className="flex flex-wrap gap-2">
          {COMMON_FEATURES.map((feature) => {
            const isSelected = selectedFeatures.includes(feature);
            return (
              <button
                key={feature}
                type="button"
                onClick={() => toggleFeature(feature)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                }`}
              >
                {feature}
              </button>
            );
          })}
        </div>

        {/* Custom feature input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customFeature}
            onChange={(e) => setCustomFeature(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomFeature();
              }
            }}
            placeholder="Add custom feature..."
            className={`${inputClass} flex-1`}
          />
          <button
            type="button"
            onClick={addCustomFeature}
            disabled={!customFeature.trim()}
            className="flex items-center gap-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg text-sm font-medium text-gray-700 transition-colors"
          >
            <Plus size={14} /> Add
          </button>
        </div>

        {/* Selected features as chips */}
        {selectedFeatures.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedFeatures.map((feature) => (
              <span
                key={feature}
                className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full border border-blue-100"
              >
                {feature}
                <button
                  type="button"
                  onClick={() => toggleFeature(feature)}
                  className="hover:text-blue-900"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ── Submit ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pb-8">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium px-8 py-3 rounded-lg text-sm transition-colors"
        >
          {isSubmitting && <Loader2 size={15} className="animate-spin" />}
          {isSubmitting
            ? "Saving..."
            : mode === "edit"
              ? "Save Changes"
              : "Submit Listing"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
