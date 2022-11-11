import { Button } from "./button";
import { Textarea } from "./textarea";

export const ProofComment = () => (
  <div className="flex flex-col justify-center items-center w-full">
    <div className="rounded-md transition-all  w-full shadow-sm bg-white flex flex-col items-center justify-between border border-gray-200">
      <div className="w-full p-5 bg-white">
        <Textarea
          placeholder="Add your comment"
          onChangeHandler={() => console.log("todo")}
          value={""}
        />
      </div>
      <div className="w-full flex bg-gray-100 p-5 items-center justify-center">
        <div className="grow 1"></div>
        <p>Post as</p>
        <div className="px-1">Nounder</div>
        <div className="px-1">Noun holder</div>
        <div className="px-1">2 or more</div>
      </div>
    </div>
    <div className="py-2"></div>
    <div className="flex flex-row w-full justify-end">
      <Button
        onClickHandler={() => console.log("todo")}
        color={"white"}
        backgroundColor={"black"}
      >
        Post Anonymously{" "}
      </Button>
    </div>
  </div>
);

// <div className="rounded-md transition-all shadow-sm bg-white p-5 flex flex-col items-center justify-between border border-gray-200 hover:border-gray-300 hover:cursor-pointer">
//   <div className="space-x-2">
//     <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-800">
//       Ends in 5 hours
//     </span>
//     <span className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800">
//       Active
//     </span>
//   </div>
//   <div className="bg-gray-100 p-10"></div>
// </div>
