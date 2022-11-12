import { Prop } from "@prisma/client";

export interface PropsPayload {
  props: Prop[];
}

export interface ErrorResponse {
  err: string;
}

export interface PropGroupPayload {
  root: string;
  pathElements: string[];
  pathIndices: string[];
}
