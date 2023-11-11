import { Leaf, Prop, Comment } from "@prisma/client";

export interface PropsPayload {
  props: Prop[];
}

export interface ErrorResponse {
  err: string;
}

export interface LeafPayload {
  data: string;
  path: string[];
  indices: string[];
}

export interface GroupPayload {
  root: string;
  leaves: LeafPayload[];
  type: string; // type.name in db
}

export interface PropGroupsPayload {
  groups: GroupPayload[];
}

export interface PropCommentsPayload {
  comments: Comment[];
}

export interface BonsaiResponse {
  proof: `0x${string}`;
  from: `0x${string}`;
  to: `0x${string}`;
  root: `0x${string}`;
}
