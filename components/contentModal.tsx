import React, { useRef } from "react";
import { NotFullScreenModal } from "./modal";

interface IProps {
  modalShown: boolean;
  closeModal: () => void;
  contentURL: string;
}
export const ContentModal = ({
  modalShown,
  closeModal,
  contentURL,
}: IProps) => {
  const currentStepRef = useRef(null);
  return (
    <NotFullScreenModal
      open={modalShown}
      initialFocus={currentStepRef}
      setClosed={closeModal}
      modalClassName="h-full flex-col items-center"
      contentClassName="min-w-full aspect-video !p-0"
    >
      <iframe
        src={contentURL}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        className="h-full w-full"
      ></iframe>
    </NotFullScreenModal>
  );
};
