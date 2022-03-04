import React, { useRef } from "react";
import { LoadingSpinner } from "./animations";
import { NotFullScreenModal } from "./modal";

interface IProps {
  modalShown: boolean;
  closeModal: () => void;
  contentURL: string;
  contentType:string;
}
export const ContentModal = ({
  modalShown,
  closeModal,
  contentURL,
  contentType,
}: IProps) => {
  const currentStepRef = useRef(null);
  const [loader, setLoader] = React.useState(true);
  const hideLoader = () =>{
    setLoader(false);
  }
  return (
    <NotFullScreenModal
      open={modalShown}
      initialFocus={currentStepRef}
      setClosed={closeModal}
      modalClassName="h-full flex-col items-center "
      contentClassName={`min-w-full ${contentType.toLowerCase()==="rich"?'aspect-square':'aspect-video'} !p-0`}
    >
      {loader && <div className="w-full h-full flex justify-center items-center"> <LoadingSpinner classes="w-10 h-10"/></div>}
      <iframe
        src={contentURL}
        title="Content Player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        className="h-full w-full"
        onLoad={hideLoader}
      ></iframe>
    </NotFullScreenModal>
  );
};
