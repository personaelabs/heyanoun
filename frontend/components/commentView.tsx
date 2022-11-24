// import Image from 'next/image'
import AnonPill, { NounSet } from "./anonPill";

interface ICommentViewProps {
  message: string;
  proof: string;
}

const CommentView: React.FC<ICommentViewProps> = ({ message, proof }) => {
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
      <p className="mt-3">{message}</p>
    </div>
  );
};

export default CommentView;
