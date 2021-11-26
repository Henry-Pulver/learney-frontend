import React, { useState, useEffect, useRef } from "react";
import { InformationCircleIcon } from "@heroicons/react/outline";
import { IconButtonTippy } from "./buttons";
import Modal from "./modal";

export default function IntroButton({ openAtStart, buttonPressFunction }) {
  const [introShown, setIntroShown] = useState(openAtStart);

  // Here so the slide number is remembered between closing & opening the modal
  const [introSlideNumber, setIntroSlide] = useState(0);

  const [introSlidesJson, setIntroSlidesJson] = useState(null);
  // TODO: replace below with useAsync() so it's in line with the rest of the codebase
  useEffect(() => {
    (async function () {
      const response = await fetch("/introSlides.json");
      const slides = await response.json();
      setIntroSlidesJson(slides);
    })();
  }, []);

  // So the 'next slide' button is focused on load
  const initialFocus = useRef(null);

  return (
    <>
      <IconButtonTippy content="How to use Learney">
        <button
          className="mobile-icon-button lg:gray-icon-btn"
          onClick={() => setIntroShown(true)}
        >
          <div className="block lg:hidden px-2 sm:px-4 text-black">
            How to use Learney
          </div>
          <span className="sr-only">Information</span>
          <InformationCircleIcon className="h-7 w-7" />
        </button>
      </IconButtonTippy>
      <Modal
        open={introShown}
        setOpen={setIntroShown}
        initialFocus={initialFocus}
      >
        <IntroSection
          introSlideNumber={introSlideNumber}
          setIntroSlide={setIntroSlide}
          introSlides={introSlidesJson}
          buttonPressFunction={buttonPressFunction}
          initialFocus={initialFocus}
        />
      </Modal>
    </>
  );
}

export function IntroSection({
  introSlideNumber,
  setIntroSlide,
  introSlides,
  buttonPressFunction,
  initialFocus,
}) {
  const prevSlide = buttonPressFunction(
    () => setIntroSlide(introSlideNumber - 1),
    "prev-intro"
  );
  const nextSlide = buttonPressFunction(
    () => setIntroSlide(introSlideNumber + 1),
    "next-intro"
  );

  return (
    <div className="text-black block">
      <h2 className="text-black m-2 text-2xl font-bold">
        {introSlides ? introSlides[introSlideNumber].title : ""}
      </h2>
      <div className="flex mb-4">
        <video
          className="m-auto"
          src={
            introSlides
              ? `${location.protocol}//${location.host}/${introSlides[introSlideNumber].gif}`
              : ""
          }
          autoPlay
          loop
          muted
        />
      </div>
      <IntroTextSection
        introSlides={introSlides}
        introSlideNumber={introSlideNumber}
      />
      <SlideDiv
        prevSlide={prevSlide}
        nextSlide={nextSlide}
        introSlideNumber={introSlideNumber}
        numSlides={introSlides ? introSlides.length : 0}
        initialFocus={initialFocus}
      />
    </div>
  );
}

function IntroTextSection({ introSlides, introSlideNumber }) {
  let slideInfo;
  if (introSlides) slideInfo = introSlides[introSlideNumber];
  let elementArray = [];

  // Generate text
  if (slideInfo) {
    for (let i = 0; i < slideInfo.text.length; i++) {
      let textItem = slideInfo.text[i];
      if (typeof textItem === "string") {
        if (textItem === "br") {
          elementArray.push(<br key={elementArray.length} />);
          elementArray.push(<br key={elementArray.length} />);
        } else {
          elementArray.push(textItem);
        }
      } else if (textItem[0] === "a") {
        elementArray.push(
          <a
            className="underline text-blue-500 hover:text-blue-600 cursor-pointer visited:text-pink-500"
            {...textItem[1]}
            key={elementArray.length}
          >
            {textItem[2]}
          </a>
        );
      } else if (textItem[0] === "b") {
        elementArray.push(
          <b {...textItem[1]} key={elementArray.length}>
            {textItem[2]}
          </b>
        );
      }
    }
  }
  return <div className="py-4">{elementArray}</div>;
}

function SlideDiv({
  prevSlide,
  nextSlide,
  introSlideNumber,
  numSlides,
  initialFocus,
}) {
  let firstSlide = introSlideNumber === 0;
  let lastSlide = introSlideNumber === numSlides - 1;

  return (
    <div className="pt-4 pb-2 m-auto inline-flex">
      <button
        onClick={firstSlide ? () => {} : prevSlide}
        className={firstSlide ? "btn-deactivated" : "btn-blue"}
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Prev
      </button>
      <div className="text-center text-gray-500 px-4 py-2">
        {(introSlideNumber + 1).toString() + "/" + numSlides.toString()}
      </div>
      <button
        onClick={lastSlide ? () => {} : nextSlide}
        ref={initialFocus}
        className={lastSlide ? "btn-deactivated" : "btn-blue"}
      >
        Next
        <svg
          className="w-5 h-5 ml-2"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
