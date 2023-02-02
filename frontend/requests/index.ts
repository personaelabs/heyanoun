import axios from "axios";
import { PropCommentsPayload } from "../types/api";

export const getPropComments = (propId: number) => async () =>
  (
    await axios.get<PropCommentsPayload>("/api/getPropComments", {
      params: {
        propId,
      },
    })
  ).data;
