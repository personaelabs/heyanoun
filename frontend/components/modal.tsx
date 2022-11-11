import { useState, useRef } from "react";
import { Dialog } from "@headlessui/react";

const Modal = () => {
  let [isOpen, setIsOpen] = useState(true);
  let completeButtonRef = useRef(null);

  return (
    <Dialog
      open={isOpen}
      initialFocus={completeButtonRef}
      onClose={() => setIsOpen(false)}
      className="relative z-50"
    >
      {/* The backdrop, rendered as a fixed sibling to the panel container */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* This is the actual modal and it's contents */}
      <div className="fixed inset-0 flex items-center justify-center">
        <Dialog.Panel className="min-h-screen w-full max-w-4xl bg-white">
          <div>
            <div className="p-8">
              <h1 className="text-4xl font-bold">Nouns Builder Protocol</h1>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 p-6">
              This is the comments section
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default Modal;
