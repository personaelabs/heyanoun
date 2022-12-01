import { Leaf, Prop, Comment } from "@prisma/client";

export interface PropsPayload {
  props: Prop[];
}

export interface ErrorResponse {
  err: string;
}

export interface GroupPayload {
  root: string;
  leaves: Leaf[];
}

export interface PropCommentsPayload {
  comments: Comment[];
}
