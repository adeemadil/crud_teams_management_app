"use client";
import React, { useState, forwardRef } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronRight, GripVertical, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import ThreeStateCircle from "./ThreeStateCircle";
import { Checkbox } from "./ui/checkbox";

interface Team {
  id: string;
  team_name: string;
  manager_approval: "pending" | "approved" | "rejected";
  director_approval: "pending" | "approved" | "rejected";
  members?: Array<{
    id: string;
    name: string;
    date_of_birth?: string;
  }>;
}

interface TeamRowProps {
  team: Team;
  isSelected: boolean;
  onSelect: (teamId: string, selected: boolean) => void;
  onStatusChange: (teamId: string, approvalType: "manager" | "director", status: "pending" | "approved" | "rejected") => Promise<void>;
  onDeleteTeam: (teamId: string) => void;
  onDeleteMember: (memberId: string) => void;
  dragHandleProps?: Record<string, unknown>;
  style?: React.CSSProperties;
}

const TeamRow = forwardRef<HTMLTableRowElement, TeamRowProps>(({ team, isSelected, onSelect, onStatusChange, onDeleteTeam, onDeleteMember, dragHandleProps, style }, ref) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete team "${team.team_name}"?`)) {
      onDeleteTeam(team.id);
    }
  };

  const handleDeleteMember = (memberId: string, memberName: string) => {
    if (window.confirm(`Are you sure you want to delete member "${memberName}"?`)) {
      onDeleteMember(memberId);
    }
  };

  return (
    <>
      <tr ref={ref} style={style} className="border-b hover:bg-muted/50 transition-colors">
        <td className="p-2 w-8">
          <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </div>
        </td>
        <td className="p-2 w-8">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(team.id, checked as boolean)}
          />
        </td>
        <td className="p-2 w-8">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="hover:bg-muted p-1 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </td>
        <td className="p-2 font-medium">{team.team_name}</td>
        <td className="p-2 text-center">
          <ThreeStateCircle
            teamId={team.id}
            approvalType="manager"
            currentStatus={team.manager_approval}
            onStatusChange={onStatusChange}
          />
        </td>
        <td className="p-2 text-center">
          <ThreeStateCircle
            teamId={team.id}
            approvalType="director"
            currentStatus={team.director_approval}
            onStatusChange={onStatusChange}
          />
        </td>
        <td className="p-2">
          <div className="flex gap-3 text-sm">
            <Link href={`/team/${team.id}`} className="text-blue-600 hover:underline flex items-center gap-1">
              <Edit className="w-4 h-4" />
              Edit
            </Link>
            <button onClick={handleDelete} className="text-blue-600 hover:underline flex items-center gap-1">
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && team.members && team.members.map((member, index) => (
        <tr key={member.id || `${team.id}-member-${index}`} className="border-b bg-muted/20">
          <td colSpan={3}></td>
          <td className="p-2 pl-8">
            <span className="text-muted-foreground">
              Member {index + 1}: {member.name}
              {member.date_of_birth ? (
                <>
                  {" "}
                  <span className="text-xs text-muted-foreground">
                    ({format(new Date(member.date_of_birth), "dd MMM yyyy")})
                  </span>
                </>
              ) : null}
            </span>
          </td>
          <td colSpan={2}></td>
          <td className="p-2">
            <div className="flex gap-3 text-sm">
              <Link href={`/team/${team.id}`} className="text-blue-600 hover:underline">Edit</Link>
              <button
                onClick={() => handleDeleteMember(member.id, member.name)}
                className="text-blue-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
});

TeamRow.displayName = "TeamRow";

export default TeamRow;
