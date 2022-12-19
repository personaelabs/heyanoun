export const ProposalRowLoading = ({ count = 5 }: { count: number }) => {
  const renderRows = () => {
    const rows = [];
    for (let i = 0; i < count; i++) {
      rows.push(
        <div key={i} className="rounded-md transition-all shadow-sm bg-white p-3 md:p-7 flex items-center justify-between border border-gray-200 animate-pulse">
          <div className="flex justify-center items-center text-gray-800">
            <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-200 w-20 mr-12"></div>
            <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-200 w-36 sm:w-96 md:w-[500px]"></div>
          </div>
          <div className="space-x-0 md:space-x-2 space-y-2 md:space-y-0">
            <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-200 w-12"></div>
          </div>
        </div>
      );
    }
    return rows;
  };

  return <div className="space-y-3">{renderRows()}</div>;
};
