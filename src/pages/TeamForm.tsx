"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface TeamMember {
  id?: string;
  name: string;
  gender: string;
  date_of_birth: string;
  contact_no: string;
}

const TeamForm = () => {
  const router = useRouter();
  const params = useParams();
  const id = (params as any)?.id as string | undefined;
  const isEditing = Boolean(id && id !== "new");

  const [isLoading, setIsLoading] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([
    { name: "", gender: "", date_of_birth: "", contact_no: "" },
  ]);

  useEffect(() => {
    if (isEditing) {
      loadTeam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, id]);

  const loadTeam = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/teams/${id}`);
      if (!res.ok) throw new Error("Failed to load team");
      const team = await res.json();

      setTeamName(team.teamName);
      setTeamDescription(team.teamDescription);
      setMembers(
        team.members?.length > 0
          ? team.members.map((m: any) => ({
              id: m._id,
              name: m.name,
              gender: m.gender,
              date_of_birth: m.dateOfBirth,
              contact_no: m.contactNo,
            }))
          : [{ name: "", gender: "", date_of_birth: "", contact_no: "" }]
      );
    } catch (error) {
      toast.error("Failed to load team");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const addMember = () => {
    setMembers([...members, { name: "", gender: "", date_of_birth: "", contact_no: "" }]);
  };

  const removeMember = (index: number) => {
    const newMembers = members.filter((_, i) => i !== index);
    setMembers(newMembers.length > 0 ? newMembers : [{ name: "", gender: "", date_of_birth: "", contact_no: "" }]);
  };

  const updateMember = (index: number, field: keyof TeamMember, value: string) => {
    const newMembers = [...members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setMembers(newMembers);
  };

  const validateForm = () => {
    if (!teamName.trim()) {
      toast.error("Team name is required");
      return false;
    }
    if (!teamDescription.trim()) {
      toast.error("Team description is required");
      return false;
    }
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      if (!member.name.trim()) {
        toast.error(`Member ${i + 1}: Name is required`);
        return false;
      }
      if (!member.gender) {
        toast.error(`Member ${i + 1}: Gender is required`);
        return false;
      }
      if (!member.date_of_birth) {
        toast.error(`Member ${i + 1}: Date of birth is required`);
        return false;
      }
      if (!member.contact_no.trim()) {
        toast.error(`Member ${i + 1}: Contact number is required`);
        return false;
      }
      if (!/^\d+$/.test(member.contact_no)) {
        toast.error(`Member ${i + 1}: Contact number must contain only numbers`);
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    if (!window.confirm("Are you sure you want to save this team?")) {
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing) {
        const res = await fetch(`/api/teams/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teamName,
            teamDescription,
            members: members.map((m) => ({
              name: m.name,
              gender: m.gender,
              dateOfBirth: m.date_of_birth,
              contactNo: m.contact_no,
            })),
          }),
        });
        if (!res.ok) throw new Error("Failed to update team");
      } else {
        const res = await fetch(`/api/teams`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teamName,
            teamDescription,
            members: members.map((m) => ({
              name: m.name,
              gender: m.gender,
              dateOfBirth: m.date_of_birth,
              contactNo: m.contact_no,
            })),
          }),
        });
        if (!res.ok) throw new Error("Failed to create team");
      }

      toast.success("Team saved successfully");
      router.push("/");
    } catch (error) {
      toast.error("Failed to save team");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return format(date, "yyyy-MM-dd");
    } catch {
      return "";
    }
  };

  if (isLoading && isEditing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4">
        <h1 className="text-2xl font-bold">{isEditing ? "Edit Team" : "New Team"}</h1>
      </header>

      <main className="container mx-auto p-6 max-w-4xl">
        <div className="bg-card p-6 rounded-lg shadow space-y-6">
          <div className="space-y-2">
            <Label htmlFor="teamName">Team Name *</Label>
            <Input
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamDescription">Team Description *</Label>
            <Textarea
              id="teamDescription"
              value={teamDescription}
              onChange={(e) => setTeamDescription(e.target.value)}
              placeholder="Enter team description"
              rows={4}
              maxLength={500}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Team Members</h3>
              <Button onClick={addMember} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add New Member
              </Button>
            </div>

            {members.map((member, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4 relative">
                {members.length > 1 && (
                  <Button
                    onClick={() => removeMember(index)}
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}

                <h4 className="font-medium">Member {index + 1}</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      value={member.name}
                      onChange={(e) => updateMember(index, "name", e.target.value)}
                      placeholder="Enter name"
                      maxLength={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Gender *</Label>
                    <Select
                      value={member.gender}
                      onValueChange={(value) => updateMember(index, "gender", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date of Birth *</Label>
                    <Input
                      type="date"
                      value={formatDateForInput(member.date_of_birth)}
                      onChange={(e) => updateMember(index, "date_of_birth", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Contact No. *</Label>
                    <Input
                      type="tel"
                      value={member.contact_no}
                      onChange={(e) => updateMember(index, "contact_no", e.target.value)}
                      placeholder="Enter contact number"
                      maxLength={15}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleSave} disabled={isLoading} size="lg">
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
            <Button onClick={() => router.push("/")} variant="outline" size="lg">
              Exit
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeamForm;
