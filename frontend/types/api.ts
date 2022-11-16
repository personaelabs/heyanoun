import { Leaf, Prop } from "@prisma/client";

export interface PropsPayload {
  props: Prop[];
}

export interface ErrorResponse {
  err: string;
}

export interface GroupPayload {
  groupId: number;
  root: string;
  leaves: Leaf[];
}
