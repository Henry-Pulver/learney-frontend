import React from "react";
import Tippy from "@tippyjs/react";
import buttonStyles from "../styles/buttons.module.css";
import { classNames } from "../lib/reactUtils";
import { PrevArrow, NextArrow } from "./icons";

export default function IntroButtonInclTooltip({
  introShown,
  hideIntroTooltip,
  showIntroTooltip,
  buttonPressFunction,
}) {
  const [introSlideNumber, setIntroSlide] = React.useState(0);
  const prevSlide = buttonPressFunction(
    () => setIntroSlide(introSlideNumber - 1),
    "prev-intro"
  );
  const nextSlide = buttonPressFunction(
    () => setIntroSlide(introSlideNumber + 1),
    "next-intro"
  );

  const closeIntroButton = buttonPressFunction(hideIntroTooltip, "close-intro");

  const [introSlidesJson, setIntroSlidesJson] = React.useState(null);
  React.useEffect(() => {
    (async function () {
      const response = await fetch("/introSlides.json");
      const slides = await response.json();
      setIntroSlidesJson(slides);
    })();
  }, []);

  return (
    <Tippy
      id={"intro-tippy"}
      visible={introShown}
      theme={"light"}
      onClickOutside={hideIntroTooltip}
      arrow={true}
      placement={"bottom"}
      hideOnClick={false}
      interactive={true}
      maxWidth={"auto"}
      content={
        <IntroSection
          introSlides={introSlidesJson}
          prevSlide={prevSlide}
          nextSlide={nextSlide}
          introSlideNumber={introSlideNumber}
          closeIntro={closeIntroButton}
        />
      }
    >
      <button
        className={`${buttonStyles.button} ${buttonStyles.large}`}
        id="open-intro"
        onClick={introShown ? hideIntroTooltip : showIntroTooltip}
      >
        Intro
      </button>
    </Tippy>
  );
}

export function IntroSection({
  introSlides,
  prevSlide,
  nextSlide,
  introSlideNumber,
  closeIntro,
}) {
  return (
    <div className={"intro-content-container"}>
      <button className={`close ${buttonStyles.button}`} onClick={closeIntro}>
        {"X"}
      </button>
      <div className={"intro-container"}>
        <h2 className={"intro-text"}>
          {introSlides ? introSlides[introSlideNumber].title : ""}
        </h2>
        <div className={"intro-gif-div"}>
          <video
            className={"intro-gif"}
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
        {/*<IntroTextSection slideInfo={introSlides ? introSlides[introSlideNumber] : null}/>*/}
        <IntroTextSection
          introSlides={introSlides}
          introSlideNumber={introSlideNumber}
        />
        <SlideDiv
          prevSlide={prevSlide}
          nextSlide={nextSlide}
          introSlideNumber={introSlideNumber}
          numSlides={introSlides ? introSlides.length : 0}
        />
      </div>
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
          elementArray.push(<br />);
          elementArray.push(<br />);
        } else {
          elementArray.push(textItem);
        }
      } else if (textItem[0] === "a") {
        elementArray.push(<a {...textItem[1]}>{textItem[2]}</a>);
      } else if (textItem[0] === "b") {
        elementArray.push(<b {...textItem[1]}>{textItem[2]}</b>);
      }
    }
  }
  return <div className={"intro-text-div"}>{elementArray}</div>;
}

function SlideDiv({ prevSlide, nextSlide, introSlideNumber, numSlides }) {
  let firstSlide = introSlideNumber === 0;
  let lastSlide = introSlideNumber === numSlides - 1;

  return (
    <div className="intro-slide-change-div">
      <button
        onClick={firstSlide ? () => {} : prevSlide}
        className={classNames(
          firstSlide
            ? "bg-gray-300 cursor-default "
            : "cursor-pointer bg-blue-600 hover:bg-blue-500 ",
          "text-white border border-transparent text-sm font-medium rounded-lg inline-flex items-center px-4 py-2"
        )}
      >
        <PrevArrow />
        Prev
      </button>
      <div className={"text-gray-700 px-4 py-2"}>
        {(introSlideNumber + 1).toString() + "/" + numSlides.toString()}
      </div>
      <button
        onClick={lastSlide ? () => {} : nextSlide}
        className={classNames(
          lastSlide
            ? "bg-gray-300 cursor-default "
            : "cursor-pointer bg-blue-600 hover:bg-blue-500 ",
          "text-white border border-transparent text-sm font-medium rounded-lg inline-flex items-center px-4 py-2"
        )}
      >
        Next
        <NextArrow />
      </button>
    </div>
  );
}
