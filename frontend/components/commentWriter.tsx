import { useState } from "react";
import AnonPill, { NounSet } from "./anonPill";

interface CommentWriterProps {}

const CommentWriter: React.FC<CommentWriterProps> = ({}) => {
  const [activeNounSet, setActiveNounSet] = useState<NounSet>(
    NounSet.SingleNoun
  );

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-clip">
        <div className="py-2 px-4">
          <textarea
            className="mt-3 resize-none w-full min-h-[100px] focus:outline-none"
            placeholder="Add your comment..."
          />
        </div>
        <div className="bg-gray-50 border-t border-gray-100 flex justify-end items-center p-3 space-x-2">
          <span className="text-base text-gray-800 font-semibold mr-2">
            Post As
          </span>
          <div
            onClick={() => {
              setActiveNounSet(NounSet.Nounder);
            }}
          >
            <AnonPill
              nounSet={NounSet.Nounder}
              isActive={activeNounSet === NounSet.Nounder}
            />
          </div>
          <div
            onClick={() => {
              setActiveNounSet(NounSet.SingleNoun);
            }}
          >
            <AnonPill
              nounSet={NounSet.SingleNoun}
              isActive={activeNounSet === NounSet.SingleNoun}
            />
          </div>
          <div
            onClick={() => {
              setActiveNounSet(NounSet.ManyNouns);
            }}
          >
            <AnonPill
              nounSet={NounSet.ManyNouns}
              isActive={activeNounSet === NounSet.ManyNouns}
            />
          </div>
        </div>
        <div></div>
      </div>
      <div className="flex justify-end">
        <button className="bg-black transition-all hover:bg-slate-900 hover:scale-105 active:scale-100 text-white font-semibold rounded-md px-4 py-2 mt-4">
          Post Anonymously
        </button>
      </div>
    </div>
  );
};

export default CommentWriter;
