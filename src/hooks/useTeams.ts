import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface TeamMember {
  id?: string;
  name: string;
  gender: string;
  date_of_birth: string;
  contact_no: string;
}

export interface Team {
  id: string;
  team_name: string;
  team_description: string;
  manager_approval: "pending" | "approved" | "rejected";
  director_approval: "pending" | "approved" | "rejected";
  display_order: number;
  members?: TeamMember[];
}

async function jsonFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const useTeams = () => {
  const queryClient = useQueryClient();

  const { data: teams = [], isLoading, error } = useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: async () => {
      const apiTeams = await jsonFetch<any[]>("/api/teams");
      return apiTeams.map((t) => ({
        id: t._id,
        team_name: t.teamName,
        team_description: t.teamDescription,
        manager_approval: t.managerApproval,
        director_approval: t.directorApproval,
        display_order: t.order,
        members: (t.members || []).map((m: any) => ({
          id: m._id,
          name: m.name,
          gender: m.gender,
          date_of_birth: m.dateOfBirth,
          contact_no: m.contactNo,
        })),
      }));
    },
  });

  const updateApprovalMutation = useMutation({
    mutationFn: async ({
      teamId,
      approvalType,
      status,
    }: {
      teamId: string;
      approvalType: "manager" | "director";
      status: "pending" | "approved" | "rejected";
    }) => {
      await jsonFetch(`/api/teams/${teamId}/approve`, {
        method: "PATCH",
        body: JSON.stringify({ approvalType, status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      await jsonFetch(`/api/teams/${teamId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team deleted successfully");
    },
  });

  const deleteBulkMutation = useMutation({
    mutationFn: async (teamIds: string[]) => {
      await jsonFetch(`/api/teams`, { method: "DELETE", body: JSON.stringify({ ids: teamIds }) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Teams deleted successfully");
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async ({ teamId, memberId }: { teamId: string; memberId: string }) => {
      // Fetch team, remove member, PUT back
      const team = await jsonFetch<any>(`/api/teams/${teamId}`);
      const updatedMembers = (team.members || []).filter((m: any) => m._id !== memberId && m.id !== memberId);
      await jsonFetch(`/api/teams/${teamId}`, {
        method: "PUT",
        body: JSON.stringify({
          teamName: team.teamName,
          teamDescription: team.teamDescription,
          members: updatedMembers,
          managerApproval: team.managerApproval,
          directorApproval: team.directorApproval,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Member deleted successfully");
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (orderedTeams: { id: string; display_order: number }[]) => {
      const payload = orderedTeams.map((t, idx) => ({ id: t.id, order: t.display_order ?? idx }));
      await jsonFetch(`/api/teams/reorder`, { method: "POST", body: JSON.stringify(payload) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  return {
    teams,
    isLoading,
    error,
    updateApproval: updateApprovalMutation.mutateAsync,
    deleteTeam: deleteTeamMutation.mutateAsync,
    deleteBulk: deleteBulkMutation.mutateAsync,
    deleteMember: async (memberId: string) => {
      // Find team containing the member
      const team = teams.find((t) => (t.members || []).some((m) => m.id === memberId));
      if (!team) return;
      await deleteMemberMutation.mutateAsync({ teamId: team.id, memberId });
    },
    reorderTeams: reorderMutation.mutateAsync,
  };
};
