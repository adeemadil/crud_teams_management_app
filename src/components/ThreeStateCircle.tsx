import { useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

type ApprovalStatus = "pending" | "approved" | "rejected";

interface ThreeStateCircleProps {
  teamId: string;
  approvalType: "manager" | "director";
  currentStatus: ApprovalStatus;
  onStatusChange: (teamId: string, approvalType: "manager" | "director", newStatus: ApprovalStatus) => Promise<void>;
}

const ThreeStateCircle = ({ teamId, approvalType, currentStatus, onStatusChange }: ThreeStateCircleProps) => {
  const [status, setStatus] = useState<ApprovalStatus>(currentStatus);
  const [isLoading, setIsLoading] = useState(false);

  const getNextStatus = (current: ApprovalStatus): ApprovalStatus => {
    const cycle: ApprovalStatus[] = ["pending", "approved", "rejected"];
    const currentIndex = cycle.indexOf(current);
    return cycle[(currentIndex + 1) % cycle.length];
  };

  const getTooltipText = () => {
    switch (status) {
      case "pending":
        return "No Action Taken";
      case "approved":
        return "Approved";
      case "rejected":
        return "Not Approved";
    }
  };

  const handleClick = async () => {
    if (isLoading) return;
    
    const nextStatus = getNextStatus(status);
    setIsLoading(true);
    
    try {
      await onStatusChange(teamId, approvalType, nextStatus);
      setStatus(nextStatus);
      toast.success("Team Status Saved");
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="inline-flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-all hover:scale-110"
      onClick={handleClick}
      title={getTooltipText()}
      style={{
        backgroundColor: status === "pending" 
          ? "hsl(var(--approval-pending))" 
          : status === "approved" 
          ? "hsl(var(--approval-approved))" 
          : "hsl(var(--approval-rejected))",
        opacity: isLoading ? 0.5 : 1,
        pointerEvents: isLoading ? "none" : "auto"
      }}
    >
      {status === "approved" && <Check className="w-5 h-5 text-white" />}
      {status === "rejected" && <X className="w-5 h-5 text-white" />}
    </div>
  );
};

export default ThreeStateCircle;
