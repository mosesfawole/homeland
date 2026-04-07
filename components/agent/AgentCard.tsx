import Image from "next/image";
import { BadgeCheck, Phone, Mail } from "lucide-react";

interface AgentCardProps {
  agencyName: string | null;
  verificationStatus: string;
  user: {
    name: string | null;
    email: string | null;
    phone: string | null;
    avatar: string | null;
  };
}

export default function AgentCard({
  agencyName,
  verificationStatus,
  user,
}: AgentCardProps) {
  const displayName = agencyName || user.name || "Verified Agent";
  const isVerified = verificationStatus === "VERIFIED";

  return (
    <aside className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-100">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={displayName}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">
              NA
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{displayName}</p>
          {isVerified && (
            <p className="inline-flex items-center gap-1 text-xs text-emerald-600">
              <BadgeCheck size={12} /> Verified agent
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        {user.phone && (
          <p className="flex items-center gap-2">
            <Phone size={14} /> {user.phone}
          </p>
        )}
        {user.email && (
          <p className="flex items-center gap-2">
            <Mail size={14} /> {user.email}
          </p>
        )}
      </div>
    </aside>
  );
}
