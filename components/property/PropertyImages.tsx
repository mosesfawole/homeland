"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { UploadCloud, X, Star } from "lucide-react";

export interface PropertyImageInput {
  url: string;
  publicId: string;
  isPrimary?: boolean;
  order?: number;
}

interface Props {
  value: PropertyImageInput[];
  onChange: (images: PropertyImageInput[]) => void;
  maxImages?: number;
}

interface CloudinarySignature {
  signature: string;
  timestamp: number;
  folder: string;
  apiKey: string;
  cloudName: string;
}

const DEFAULT_MAX_IMAGES = 12;
const MAX_FILE_SIZE_MB = 8;

export default function PropertyImages({
  value,
  onChange,
  maxImages = DEFAULT_MAX_IMAGES,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalize = (images: PropertyImageInput[]) => {
    const normalized = images.map((img, index) => ({
      ...img,
      isPrimary: img.isPrimary ?? index === 0,
      order: index,
    }));
    if (!normalized.some((img) => img.isPrimary) && normalized.length > 0) {
      normalized[0].isPrimary = true;
    }
    return normalized;
  };

  const requestSignature = async (): Promise<CloudinarySignature> => {
    const res = await fetch("/api/uploads/cloudinary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder: "homeland/properties" }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error ?? "Failed to initialize upload");
    }

    return res.json();
  };

  const uploadToCloudinary = async (
    file: File,
    signature: CloudinarySignature,
  ): Promise<PropertyImageInput> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signature.apiKey);
    formData.append("timestamp", String(signature.timestamp));
    formData.append("signature", signature.signature);
    formData.append("folder", signature.folder);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`;
    const res = await fetch(uploadUrl, { method: "POST", body: formData });
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.error?.message ?? "Upload failed");
    }

    return {
      url: json.secure_url as string,
      publicId: json.public_id as string,
    };
  };

  const handleFiles = async (files: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(files);

    if (!fileArray.length) return;

    const availableSlots = maxImages - value.length;
    if (availableSlots <= 0) {
      setError(`You can upload up to ${maxImages} images.`);
      return;
    }

    const selected = fileArray.slice(0, availableSlots);
    const invalid = selected.find((file) => !file.type.startsWith("image/"));
    if (invalid) {
      setError("Only image files are allowed.");
      return;
    }

    const tooLarge = selected.find(
      (file) => file.size > MAX_FILE_SIZE_MB * 1024 * 1024,
    );
    if (tooLarge) {
      setError(`Each image must be under ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    try {
      setIsUploading(true);
      const signature = await requestSignature();
      const uploaded: PropertyImageInput[] = [];

      for (const file of selected) {
        const uploadedImage = await uploadToCloudinary(file, signature);
        uploaded.push(uploadedImage);
      }

      onChange(normalize([...value, ...uploaded]));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Upload failed. Please try again.";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const next = value.filter((_, i) => i !== index);
    onChange(normalize(next));
  };

  const setPrimary = (index: number) => {
    const next = value.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChange(normalize(next));
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:border-gray-300"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center gap-2 text-gray-600">
          <UploadCloud size={28} />
          <p className="text-sm">
            Drag & drop images here, or{" "}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 font-medium"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
            >
              browse
            </button>
          </p>
          <p className="text-xs text-gray-400">
            Up to {maxImages} images, max {MAX_FILE_SIZE_MB}MB each
          </p>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {isUploading && (
        <div className="text-sm text-blue-600">Uploading images...</div>
      )}

      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {value.map((image, index) => (
            <div
              key={image.publicId}
              className="relative rounded-lg overflow-hidden border border-gray-200"
            >
              <div className="relative aspect-[4/3] bg-gray-100">
                <Image
                  src={image.url}
                  alt={`Property image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>

              <div className="flex items-center justify-between px-2 py-2 bg-white">
                <button
                  type="button"
                  onClick={() => setPrimary(index)}
                  className={`inline-flex items-center gap-1 text-xs font-medium ${
                    image.isPrimary
                      ? "text-yellow-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Star size={12} />
                  {image.isPrimary ? "Primary" : "Set primary"}
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

