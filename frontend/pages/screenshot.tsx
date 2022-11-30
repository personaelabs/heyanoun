import type { NextPage } from "next";
import { useRouter } from "next/router";

const Screenshot: NextPage = () => {
  const router = useRouter();

  const { text } = router.query;
  return (
    <div>
      <div className="square w-[1280px] h-[720px] border-solid border-[25px] border-[#d63d5e]">
        <div className="flex flex-col h-full text-left p-10 justify-between">
          <div
            id="fit-text-parent"
            className="border h-[475px] overflow-hidden p-3 rounded-md font-mono text-[32px]"
          >
            {text}
          </div>
          <div className="flex justify-center items-center space-x-8 ">
            <span className="text-[#d63d5e] text-4xl font-sans font-semibold">
              Nouns DAO Member
            </span>
            <img className="max-w-[300px]" src="/2nouns-large.png" />
          </div>
        </div>
      </div>
      <style jsx>{``}</style>
    </div>
  );
};

export default Screenshot;
