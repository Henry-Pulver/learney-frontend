import React from "react";
import { InformationCircleIcon } from "@heroicons/react/outline";
import { IconButtonTippy } from "./buttons";
import { classNames } from "../lib/reactUtils";
import { ButtonPressFunction } from "../lib/types";
import { NextArrow, PrevArrow } from "./svgs/icons";

export default function IntroButton({ setIntroShown, buttonPressFunction }) {
  return (
    <>
      <IconButtonTippy content="How to use Learney">
        <button
          className="mobile-icon-button lg:gray-icon-btn"
          onClick={buttonPressFunction(
            () => setIntroShown(true),
            "Open Intro To Learney"
          )}
        >
          <div className="block px-2 text-black sm:px-4 lg:hidden">
            How to use Learney
          </div>
          <span className="sr-only">Information</span>
          <InformationCircleIcon className="h-7 w-7" />
        </button>
      </IconButtonTippy>
    </>
  );
}

export function IntroSection({
  introSlideNumber,
  setIntroSlide,
  introSlides,
  buttonPressFunction,
  initialFocus,
}: {
  introSlideNumber: number;
  setIntroSlide: (introSlideNumber: number) => void;
  introSlides: Array<any> | null;
  buttonPressFunction: ButtonPressFunction;
  initialFocus?: React.MutableRefObject<any>;
}) {
  const prevSlide = buttonPressFunction(
    () => setIntroSlide(introSlideNumber - 1),
    "Intro Previous Slide"
  );
  const nextSlide = buttonPressFunction(
    () => setIntroSlide(introSlideNumber + 1),
    "Intro Next Slide"
  );

  return (
    <div className="text-black">
      <h2 className="m-2 text-2xl font-bold text-black">
        {introSlides ? introSlides[introSlideNumber].title : ""}
      </h2>
      <div className="mb-4 flex">
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
  const elementArray = [];

  // Generate text
  if (slideInfo) {
    for (let i = 0; i < slideInfo.text.length; i++) {
      const textItem = slideInfo.text[i];
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
            className="cursor-pointer text-blue-500 underline visited:text-pink-500 hover:text-blue-600"
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
  const firstSlide = introSlideNumber === 0;
  const lastSlide = introSlideNumber === numSlides - 1;

  return (
    <div className="m-auto inline-flex pt-4 pb-2">
      <button
        onClick={firstSlide ? () => {} : prevSlide}
        className={classNames(
          firstSlide ? "btn-deactivated" : "btn-blue",
          "btn-sm"
        )}
      >
        <PrevArrow />
        Prev
      </button>
      <div className="px-4 py-2 text-center text-gray-500">
        {(introSlideNumber + 1).toString() + "/" + numSlides.toString()}
      </div>
      <button
        onClick={lastSlide ? () => {} : nextSlide}
        ref={initialFocus}
        className={classNames(
          lastSlide ? "btn-deactivated" : "btn-blue",
          "btn-sm"
        )}
      >
        Next
        <NextArrow />
      </button>
    </div>
  );
}
