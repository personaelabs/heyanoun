import { useRef } from "react";
import { Dialog } from "@headlessui/react";
import ReactMarkdown from "react-markdown";
import styles from "./Modal.module.css";
import CommentView from "../commentView";
import CommentWriter from "../commentWriter";
import { PropCommentsPayload } from "../../types/api";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

interface IModalProps {
  isOpen: boolean;
  propId: number;
  handleClose: (isOpen: boolean) => void;
  description: string;
}

const getPropComments = (propId: number) => async () =>
  (
    await axios.get<PropCommentsPayload>("/api/getPropComments", {
      params: {
        propId,
      },
    })
  ).data;

const Modal: React.FC<IModalProps> = ({
  isOpen,
  handleClose,
  propId,
  description,
}) => {
  let completeButtonRef = useRef(null);

  const { isLoading, data } = useQuery<PropCommentsPayload>({
    queryKey: [`${propId}_comments`],
    queryFn: getPropComments(propId),
    retry: 1,
    enabled: isOpen,
    staleTime: 1000,
  });

  // const startVal = description.indexOf("\n\n") + 2;
  // const cleanedDescription = description.slice(startVal);

  return (
    <Dialog
      open={isOpen}
      initialFocus={completeButtonRef}
      onClose={handleClose}
      className="relative z-50"
    >
      {/* The backdrop, rendered as a fixed sibling to the panel container */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* This is the actual modal and it's contents */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center">
          <Dialog.Panel className="w-full max-w-5xl bg-white ">
            <div className="">
              <div className="px-12 py-10">
                <ReactMarkdown className={styles.markdown}>
                  {description}
                </ReactMarkdown>
              </div>
              <div className="bg-gray-50 border-t border-gray-200 py-8 pb-16 space-y-4">
                {isLoading || !data ? (
                  <p>loading...</p>
                ) : (
                  data.comments.map((comment) => (
                    <CommentView
                      key={comment.id}
                      createdAt={comment.createdAt}
                      groupType={Number(comment.groupType)}
                      message={comment.commentMsg}
                      proof={comment.ipfsProof}
                    />
                  ))
                )}
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
