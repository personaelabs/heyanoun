// import Image from 'next/image'
import AnonPill, { NounSet } from "./anonPill";

interface ICommentViewProps {}

const CommentView: React.FC<ICommentViewProps> = ({}) => {
  return (
    <div className="bg-white rounded-md shadow-sm max-w-xl mx-auto py-4 px-5 border border-gray-200">
      <div className="flex justify-between">
        <div className="flex items-center space-x-2">
          {/* <Image width={32} height={32} src="/public/nouns.png" alt="" /> */}
          <img
            className="inline-block h-8 w-8 rounded-full"
            src="/punk-4156.jpeg"
            alt=""
          />
          <p className="text-gray-800 font-semibold">Demis G</p>
          <p className="text-gray-500 font-normal">2 days ago</p>
        </div>
        <AnonPill nounSet={NounSet.Nounder} />
      </div>
      <p className="mt-3">
        I&apos;m not convinced that we should be making a binary decision on
        this. Nor am I convinced that they need all 1000 ETH right away to
        bootstrap the DAO. My biggest concern with this proposal is that
        it&apos;s all or nothing. this is a common issue with Nouns proposals.
      </p>
    </div>
  );
};

export default CommentView;
