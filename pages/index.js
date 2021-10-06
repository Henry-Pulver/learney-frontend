import Head from "next/head";
import React, { useEffect } from "react";
import mainStyles from "../styles/main.module.css";
import introStyles from "../styles/intro.module.css";
import buttonStyles from "../styles/buttons.module.css";
import Profile from "../components/profile";
import { setupSite } from "../lib/main";
import {
  enableGoogleAnalytics,
  enableHotjarTracking,
} from "../lib/trackingScripts";

const userData = {
  user_id: "google-oauth2|107422942042952650102",
  name: "Henry Pulver",
  email: "henrypulver13@gmail.com",
  picture:
    "https://lh3.googleusercontent.com/a-/AOh14Gg82_yj2aTeve54l0gbNNaZTCtrbqwE3UFhi_NpDw=s96-c",
};

export default function Home() {
  // Below sorts out the Google Analytics & Hotjar tracking
  useEffect(() => {
    let gtagId;
    if (location.hostname.startsWith("app")) {
      enableGoogleAnalytics("G-PDX7JSVWKR");
      enableHotjarTracking();
    } else if (location.hostname.startsWith("staging")) {
      enableGoogleAnalytics("G-4F72V4175C");
      enableHotjarTracking();
    }

    setupSite("");
  }, []);

  return (
    <div>
      <Head>
        <meta charSet="UTF-8" />
        <title>Learney Prototype</title>
        <link rel="icon" href="/favicon_new-32x32.png" />
        {/*<link*/}
        {/*  rel="stylesheet"*/}
        {/*  href="https://cdn.auth0.com/js/auth0-samples-theme/1.0/css/auth0-theme.min.css"*/}
        {/*/>*/}
        <meta xmlns="http://www.w3.org/1999/xhtml" />
        <meta name="title" property="og:title" content="Learney Prototype" />
        <meta
          name="image"
          property="og:image"
          content="https://app.learney.me/static/images/2021/05/19/learney_background.png"
        />
        <meta
          property="og:image:url"
          content="https://app.learney.me/static/images/2021/05/19/learney_background.png"
        />
        <meta
          property="og:image:secure_url"
          content="https://app.learney.me/static/images/2021/05/19/learney_background.png"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://app.learney.me" />
        <meta
          name="description"
          property="og:description"
          content="The online learning platform designed to help you efficiently take your own path."
        />
        <meta
          name="viewport"
          content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />

        {/*/ Django context*/}
        {/*{{userdata | json_script:"userdata"}}*/}
        {/*{{map_uuid | json_script:"map_uuid"}}*/}
        {/*{{map_version | json_script:"map_version"}}*/}
        {/*{{allow_suggestions | json_script:"allow_suggestions"}}*/}

        {/*<link*/}
        {/*  href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css"*/}
        {/*  rel="stylesheet"*/}
        {/*/>*/}
      </Head>

      <div id="cy" />

      <Profile userdata={userData} />

      <div
        className={`${buttonStyles.topButtonToolbar} ${mainStyles.disableTouchActions}`}
      >
        <div className={introStyles.introButtonContainer}>
          <button className={buttonStyles.large} id="open-intro">
            Intro
          </button>
          <button
            className={buttonStyles.suggestionButton}
            id="make-suggestion"
          >
            Make Suggestion
          </button>
        </div>
        <label id="concept-search-bar-label">
          <select
            id={"concept-search-bar"}
            name={"concept"}
            width={"100%"}
          ></select>
        </label>
        <div className={buttonStyles.buttonToolbarDiv}>
          <button id={"save-layout"}>Save Map</button>
          <button id={"reset-layout"}>Reset Layout</button>
          <button id={"run-dagre"}>Auto-generate Layout</button>
          <button id={"reset-progress"}>Reset Progress</button>
          <button id={"reset-pan"}>Centre View</button>
        </div>
      </div>

      <div
        className={`${buttonStyles.feedbackButtons} ${mainStyles.disableTouchActions}`}
      >
        <button
          className={`${buttonStyles.circle} ${buttonStyles.flashing}`}
          id={"feedback-button"}
        >
          <img
            src="/images/feedback_icon.png"
            id="feedbackIcon"
            alt="Feedback icon"
          />
        </button>
        <button className={buttonStyles.circle} id="slack-button">
          <img src="/images/slack_logo.png" id="slackLogo" alt="Slack logo" />
        </button>
        {/*// <!--        <button class="circle feedback" id="feedbackButton" onclick="window.open('mailto:henrypulver13@gmail.com?subject=Feedback about Learney&cc=matthewphillips5320@googlemail.com','_blank')">?</button>-->*/}
      </div>
    </div>
  );
}
