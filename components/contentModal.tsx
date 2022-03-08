import React, { useRef } from "react";
import { classNames } from "../lib/reactUtils";
import { LoadingSpinner } from "./animations";
import { NotFullScreenModal } from "./modal";

interface IProps {
  modalShown: boolean;
  closeModal: () => void;
  contentURL: string;
  contentType: string;
}
export const ContentModal = ({
  modalShown,
  closeModal,
  contentURL,
  contentType,
}: IProps) => {
  const currentStepRef = useRef(null);
  const [loader, setLoader] = React.useState(true);
  const hideLoader = () => {
    setLoader(false);
  };
  return (
    <NotFullScreenModal
      open={modalShown}
      initialFocus={currentStepRef}
      setClosed={closeModal}
      modalClassName="h-full flex-col items-center "
      contentClassName={`min-w-full ${
        contentType.toLowerCase() === "rich" ? "aspect-square" : "aspect-video"
      } !p-0`}
    >
      {loader && (
        <div className="flex h-full w-full items-center justify-center">
          {" "}
          <LoadingSpinner classes="w-10 h-10" />
        </div>
      )}
      <iframe
        src={contentURL}
        title="Content Player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        className={classNames("h-full w-full", loader && "hidden")}
        onLoad={hideLoader}
      ></iframe>
    </NotFullScreenModal>
  );
};
