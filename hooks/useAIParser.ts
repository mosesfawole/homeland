"use client";
import { useState } from "react";
import type { ParsedProperty } from "@/types";

interface UseAIParserReturn {
  parse: (description: string) => Promise<ParsedProperty | null>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useAIParser(): UseAIParserReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parse = async (description: string): Promise<ParsedProperty | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/parse-property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Failed to parse description");
        return null;
      }

      return json.data as ParsedProperty;
    } catch {
      setError("Network error. Please check your connection and try again.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { parse, isLoading, error, clearError: () => setError(null) };
}
