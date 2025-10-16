import mongoose, { Schema, models, model } from "mongoose";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface TeamMember {
  name: string;
  gender: string;
  dateOfBirth: Date;
  contactNo: string;
}

export interface TeamDocument extends mongoose.Document {
  teamName: string;
  teamDescription: string;
  members: TeamMember[];
  managerApproval: ApprovalStatus;
  directorApproval: ApprovalStatus;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<TeamMember>(
  {
    name: { type: String, required: true },
    gender: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    contactNo: { type: String, required: true },
  }
);

const TeamSchema = new Schema<TeamDocument>(
  {
    teamName: { type: String, required: true },
    teamDescription: { type: String, required: true },
    members: { type: [TeamMemberSchema], default: [] },
    managerApproval: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    directorApproval: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Team = models.Team || model<TeamDocument>("Team", TeamSchema);


