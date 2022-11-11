import { Prop } from "@prisma/client";

export interface GroupWithType {
  groupId: number;
  propId: number;
  type: string; // NOTE: type.name as defined in prisma
}

export interface GroupTreeBranch {
  [groupId: number]: {
    pathIndices: string[];
    pathElements: string[];
  };
}

// NOTE: payload merkle trees by prop for users to make proofs
export interface PropTreesPayload {
  groups: GroupWithType[];

  trees: {
    [address: string]: GroupTreeBranch;
  };
}

export interface PropsPayload {
  props: Prop[];
}

export interface ErrorResponse {
  err: string;
}
