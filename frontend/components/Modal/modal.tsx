import { Dialog } from "@headlessui/react";
import ReactMarkdown from "react-markdown";
import styles from "./Modal.module.css";
import CommentView from "../commentView";
import CommentWriter from "../commentWriter";

interface IModalProps {
  isOpen: boolean;
  propId: number;
  handleClose: (isOpen: boolean) => void;
  description: string;
}

const Modal: React.FC<IModalProps> = ({
  isOpen,
  handleClose,
  propId,
  description,
}) => {
  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      {/* The backdrop, rendered as a fixed sibling to the panel container */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* This is the actual modal and it's contents */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center">
          <Dialog.Panel className="w-full max-w-5xl bg-white ">
            <div className="">
              <div className="px-4 py-3 md:px-12 md:py-10">
                <ReactMarkdown className={styles.markdown}>
                  {description}
                </ReactMarkdown>
              </div>
              <div className="bg-gray-50 border-t border-gray-200 py-8 pb-16 space-y-4">
                <CommentView />
                <CommentWriter propId={propId} />
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default Modal;
