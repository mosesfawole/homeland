import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PropertyForm from "@/components/forms/PropertyForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "New Listing — Homeland",
};

export default async function NewListingPage() {
  const session = await auth();
  if (!session || session.user.role !== "AGENT") redirect("/login");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/agent/listings"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Listings
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Listing</h1>
        <p className="text-gray-500 text-sm mt-1">
          Use AI Auto-fill to populate the form from a description, or fill it
          in manually.
        </p>
      </div>

      <PropertyForm mode="create" />
    </div>
  );
}
