"use client";

import { useState } from "react";

interface Props {
  govIdUrl: string | null;
  cacDocUrl: string | null;
  verificationStatus: string;
}

interface CloudinarySignature {
  signature: string;
  timestamp: number;
  folder: string;
  allowedFormats: string[];
  maxFileSize: number;
  resourceType: string;
  uploadType: string;
  apiKey: string;
  cloudName: string;
}

async function requestSignature(): Promise<CloudinarySignature> {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder: "homeland/kyc" }),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error ?? "Failed to initialize upload");
  }

  return res.json();
}

async function uploadToCloudinary(
  file: File,
  signature: CloudinarySignature,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signature.apiKey);
  formData.append("timestamp", String(signature.timestamp));
  formData.append("signature", signature.signature);
  formData.append("folder", signature.folder);
  formData.append("allowed_formats", signature.allowedFormats.join(","));
  formData.append("max_file_size", String(signature.maxFileSize));
  formData.append("type", signature.uploadType);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${signature.cloudName}/${signature.resourceType}/upload`;
  const res = await fetch(uploadUrl, { method: "POST", body: formData });
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.error?.message ?? "Upload failed");
  }

  return (json.public_id as string) ?? (json.secure_url as string);
}

export default function KycForm({
  govIdUrl,
  cacDocUrl,
  verificationStatus,
}: Props) {
  const [govId, setGovId] = useState<string | null>(govIdUrl);
  const [cacDoc, setCacDoc] = useState<string | null>(cacDocUrl);
  const [govIdName, setGovIdName] = useState<string | null>(null);
  const [cacDocName, setCacDocName] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"gov" | "cac" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpload = async (
    file: File,
    setter: (url: string) => void,
  ) => {
    setError(null);
    if (file.size > 6 * 1024 * 1024) {
      setError("Each document must be under 6MB.");
      return;
    }
    const signature = await requestSignature();
    const url = await uploadToCloudinary(file, signature);
    setter(url);
  };

  const submit = async () => {
    setError(null);
    setSuccess(null);
    if (!govId && !cacDoc) {
      setError("Please upload at least one document.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/agent/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ govIdUrl: govId, cacDocUrl: cacDoc }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Failed to submit documents.");
        return;
      }
      setSuccess("Documents submitted. Review in progress.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Verification</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload your KYC documents to get verified.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Status: <span className="font-semibold text-gray-600">{verificationStatus}</span>
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg">
          {success}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Government ID
          </label>
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-3">
            <label className="inline-flex items-center px-3 py-2 rounded-md bg-slate-900 text-white text-xs font-semibold cursor-pointer hover:bg-slate-800 transition">
              Choose file
              <input
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  setGovIdName(file.name);
                  setUploading("gov");
                  try {
                    await handleUpload(file, (url) => setGovId(url));
                  } catch (err: unknown) {
                    setError(err instanceof Error ? err.message : "Upload failed.");
                  } finally {
                    setUploading(null);
                  }
                }}
                className="sr-only"
              />
            </label>
            <span className="text-xs text-slate-600 truncate">
              {uploading === "gov"
                ? "Uploading..."
                : govIdName ?? (govId ? "Uploaded" : "No file selected")}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            CAC Document (optional)
          </label>
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-3">
            <label className="inline-flex items-center px-3 py-2 rounded-md bg-slate-900 text-white text-xs font-semibold cursor-pointer hover:bg-slate-800 transition">
              Choose file
              <input
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  setCacDocName(file.name);
                  setUploading("cac");
                  try {
                    await handleUpload(file, (url) => setCacDoc(url));
                  } catch (err: unknown) {
                    setError(err instanceof Error ? err.message : "Upload failed.");
                  } finally {
                    setUploading(null);
                  }
                }}
                className="sr-only"
              />
            </label>
            <span className="text-xs text-slate-600 truncate">
              {uploading === "cac"
                ? "Uploading..."
                : cacDocName ?? (cacDoc ? "Uploaded" : "No file selected")}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={isSubmitting}
        className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-60"
      >
        {isSubmitting ? "Submitting..." : "Submit for Review"}
      </button>
    </div>
  );
}
