import { TableSession } from "../types/session";
import { Users, Clock, MapPin } from "lucide-react";

interface TableSessionBadgeProps {
  session: TableSession | null;
  className?: string;
}

export default function TableSessionBadge({
  session,
  className = "",
}: TableSessionBadgeProps) {
  if (!session) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "paying":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDuration = (startTime: Date) => {
    const minutes = Math.floor(
      (Date.now() - startTime.getTime()) / (1000 * 60),
    );
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div
      className={`inline-flex items-center space-x-3 px-4 py-2 border rounded-xl ${getStatusColor(session.status)} ${className}`}
    >
      <div className="flex items-center space-x-2">
        <MapPin className="w-4 h-4" />
        <span className="font-semibold">Table {session.tableId}</span>
      </div>

      <div className="flex items-center space-x-2">
        <Users className="w-4 h-4" />
        <span className="text-sm">{session.partySize} guests</span>
      </div>

      <div className="flex items-center space-x-2">
        <Clock className="w-4 h-4" />
        <span className="text-sm">{formatDuration(session.startedAt)}</span>
      </div>

      <div className="text-xs font-medium capitalize">{session.status}</div>
    </div>
  );
}
