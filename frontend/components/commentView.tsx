// import Image from 'next/image'
import AnonPill, { NounSet } from "./anonPill";
import * as React from "react";
import dayjs from "dayjs";
const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

interface ICommentViewProps {
  message: string;
  groupType: number;
  createdAt: Date;
  proof: string;
}

const CommentView: React.FC<ICommentViewProps> = ({
  message,
  proof,
  createdAt,
  groupType,
}) => {
  const groupTypeToNounSet = React.useMemo(() => {
    const nounSet: NounSet = groupType;
    return nounSet;
  }, [groupType]);

  const dateFromDescription = React.useMemo(() => {
    const date = dayjs(createdAt);
    // Dayjs doesn't have typings on relative packages so we have to do this
    // @ts-ignore
    return date.fromNow();
  }, [createdAt]);

  return (
    <div className="bg-white rounded-md shadow-sm max-w-xl mx-auto py-4 px-5 border border-gray-200">
      <div className="flex justify-between">
        <div className="flex items-center space-x-2">
          <img
            className="inline-block h-8 w-8 rounded-full"
            src="/placeholder.png"
            alt=""
          />
          <p className="text-gray-800 font-semibold">Anonymous Noun Holder</p>
          <p className="text-gray-500 font-normal">{dateFromDescription}</p>
        </div>
        <AnonPill proofURL={proof} nounSet={groupTypeToNounSet} isClickable />
      </div>
      <p className="mt-3">{message}</p>
    </div>
  );
};

export default CommentView;
