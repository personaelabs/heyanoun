import { useQuery } from "@tanstack/react-query";

import GeneralCommentWriter from "./generalCommentWriter";
import CommentView from "./commentView";
import Spinner from "./spinner";

import { getPropComments } from "../requests";
import { PropCommentsPayload } from "../types/api";

const GeneralCommentPanel = () => {
  const propId = -1;
  const { isLoading, data, error } = useQuery<PropCommentsPayload>({
    queryKey: [`${propId}_comments`],
    queryFn: getPropComments(propId),
    retry: 1,
    enabled: true,
    staleTime: 1000,
  });

  return (
    <div className="flex justify-center items-center">
      <div className="space-y-4">
        <h2 className="ml-2 text-2xl font-semibold text-gray-800">
          What scam/phishing do you want to report?
        </h2>
        <div className="p-6 py-3 rounded-lg bg-gray-100 border border-gray-200">
          <span className="text-lg">❤️</span>
          <span className="text-base ml-1">
            We ask to submit scam/phishing reports with
            block number and transaction hash
          </span>
        </div>

        <GeneralCommentWriter propId={1} />

        <div className="bg-gray-50 border-t border-gray-200 py-8 pb-16 space-y-4">
          {isLoading ? (
            <Spinner />
          ) : data?.comments.length !== 0 ? (
            data?.comments
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((comment) => (
                <CommentView
                  key={comment.id}
                  createdAt={comment.createdAt}
                  groupType={Number(comment.groupType)}
                  message={comment.commentMsg}
                  proof={comment.ipfsProof}
                />
              ))
          ) : (
            <div className="py-1 px-2 flex row items-center justify-center">
              <p className="text-l">No comments yet!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneralCommentPanel;
