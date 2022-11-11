import { useState } from "react";
import Modal from "./modal";

interface IProposalRowProps {
  number: number;
  title?: string;
  endTime?: string;
  finalized?: `active` | `queued` | `executed` | `canceled`;
}

const ProposalRow: React.FC<IProposalRowProps> = ({
  title = "Nouns Builder Protocol",
  number,
  endTime = "2021-08-01T00:00:00.000Z",
  finalized = "active",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        handleClose={(e) => {
          setIsOpen(false);
        }}
      />

      <div
        onClick={openModal}
        className="rounded-md transition-all shadow-sm bg-white p-5 flex items-center justify-between border border-gray-200 hover:border-gray-300 hover:cursor-pointer"
      >
        <div className="flex items-center text-gray-800">
          <div className="text-lg font-semibold">{number}</div>
          <h4 className="text-xl font-semibold ml-4">Nouns Builder Protocol</h4>
        </div>
        <div className="space-x-2">
          <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-800">
            Ends in 5 hours
          </span>
          <span className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800">
            Active
          </span>
        </div>
      </div>
    </>
  );
};

export default ProposalRow;
