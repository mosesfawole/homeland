import { headers } from "next/headers";

export async function getCallbackUrl(fallback: string) {
  const headerList = await headers();
  const candidates = [
    headerList.get("x-nextjs-pathname"),
    headerList.get("x-pathname"),
    headerList.get("x-invoke-path"),
    headerList.get("next-url"),
    headerList.get("x-url"),
  ];

  const path = candidates.find((value) => value && value.startsWith("/"));
  return path ?? fallback;
}
