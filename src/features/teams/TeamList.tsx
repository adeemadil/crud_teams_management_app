"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import SearchBar from "@/src/components/SearchBar";
import TeamRow from "@/src/components/TeamRow";
import { useTeams } from "@/src/hooks/useTeams";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Loader2 } from "lucide-react";

const SortableTeamRow = ({ team, ...props }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: team.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TeamRow 
      ref={setNodeRef} 
      style={style}
      team={team} 
      dragHandleProps={{ ...attributes, ...listeners }} 
      {...props} 
    />
  );
};

const TeamList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());
  const { teams, isLoading, updateApproval, deleteTeam, deleteBulk, deleteMember, reorderTeams } = useTeams();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredTeams = useMemo(() => {
    if (!searchQuery) return teams;

    const query = searchQuery.toLowerCase();
    return teams.filter((team) => {
      const teamNameMatch = team.team_name.toLowerCase().includes(query);
      const memberMatch = team.members?.some((member) =>
        member.name.toLowerCase().includes(query)
      );
      return teamNameMatch || memberMatch;
    });
  }, [teams, searchQuery]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = filteredTeams.findIndex((team) => team.id === active.id);
      const newIndex = filteredTeams.findIndex((team) => team.id === over.id);

      const newOrder = arrayMove(filteredTeams, oldIndex, newIndex);
      const orderedTeams = newOrder.map((team, index) => ({
        id: team.id,
        display_order: index,
      }));

      reorderTeams(orderedTeams);
    }
  };

  const handleSelectTeam = (teamId: string, selected: boolean) => {
    const newSelected = new Set(selectedTeams);
    if (selected) {
      newSelected.add(teamId);
    } else {
      newSelected.delete(teamId);
    }
    setSelectedTeams(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedTeams.size === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedTeams.size} team(s)?`)) {
      deleteBulk(Array.from(selectedTeams));
      setSelectedTeams(new Set());
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">TeamStatus</h1>
        <Link href="/team/new">
          <Button variant="secondary" size="lg">
            New Team
          </Button>
        </Link>
      </header>

      <main className="container mx-auto p-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search team or member name..."
        />

        {selectedTeams.size > 0 && (
          <div className="mb-4">
            <Button onClick={handleBulkDelete} variant="destructive">
              Delete All ({selectedTeams.size})
            </Button>
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full bg-card">
              <thead className="bg-muted">
                <tr className="border-b">
                  <th className="p-2 w-8"></th>
                  <th className="p-2 w-8">
                    <input
                      type="checkbox"
                      aria-label="Select all teams"
                      checked={filteredTeams.length > 0 && filteredTeams.every((t) => selectedTeams.has(t.id))}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const next = new Set<string>();
                        if (checked) {
                          filteredTeams.forEach((t) => next.add(t.id));
                        }
                        setSelectedTeams(next);
                      }}
                    />
                  </th>
                  <th className="p-2 w-8"></th>
                  <th className="p-2 text-left">Team Name</th>
                  <th className="p-2 text-center">Approved<br />by Manager</th>
                  <th className="p-2 text-center">Approved<br />by Director</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                <SortableContext
                  items={filteredTeams.map((team) => team.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {filteredTeams.map((team) => (
                  <SortableTeamRow
                      key={team.id}
                      team={team}
                      isSelected={selectedTeams.has(team.id)}
                      onSelect={handleSelectTeam}
                    onStatusChange={async (teamId: string, approvalType: "manager" | "director", status: "pending" | "approved" | "rejected") => {
                      await updateApproval({ teamId, approvalType, status });
                    }}
                      onDeleteTeam={deleteTeam}
                      onDeleteMember={deleteMember}
                    />
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </div>
        </DndContext>
      </main>
    </div>
  );
};

export default TeamList;


