import { Leaf, Prop } from "@prisma/client";

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
