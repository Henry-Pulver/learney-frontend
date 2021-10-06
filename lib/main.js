import "./csrf";
import { initCy, isMobile, panByAndZoom } from "./graph";
import { makeMouseoverTippy } from "./iconsAndButtons";
import { signInTooltip } from "./learningAndPlanning";
import { showIntroTippy, toggleIntro } from "./intro";
import "./buttons";
import {
  logPageView,
  updateQuestionAnswerUsers,
  userId,
  localStorage,
  mapUUID,
  mapVersion,
  isAnonymousUser,
  buttonPress,
} from "./utils";
import { cacheHeaders } from "./csrf";

export function setupSite(staticFileLocation) {
  const graphPromise = fetch(
    "/api/v0/knowledge_maps?" +
      new URLSearchParams({ map_uuid: mapUUID, version: mapVersion }),
    {
      method: "GET",
      headers: cacheHeaders,
    }
  ).then((file) => file.json());
  const stylePromise = fetch(`${staticFileLocation}knowledge_graph.cycss`).then(
    (file) => file.text()
  );
  const introPromise = fetch(`${staticFileLocation}introSlides_v021.json`).then(
    (file) => file.json()
  );

  makeMouseoverTippy(
    "#feedback-button",
    "Play your part in the future of Learney! We want your feedback and suggestions!"
  );
  makeMouseoverTippy(
    "#slack-button",
    "Want to join our thriving community of contributors and learners? Join our Slack!"
  );
  // document.getElementById("feedback-button").addEventListener("mouseover", makeMouseoverTippy("#feedback-button", "Play your part in the future of Learney! We want to hear your thoughts and suggestions!"));
  // document.getElementById("slack-button").addEventListener("mouseover", makeMouseoverTippy("#slack-button", "Want to join the community or chat to us? Join our Slack and tell us!"));
  // document.getElementById("feedbackButton").addEventListener("mouseover", makeMouseoverTippy("#feedbackButton", "Not a fan of Slack? Email us your feedback!"));

  // Show profile div if hidden
  document.getElementsByClassName("profileImage")[0].onclick = buttonPress(
    function () {
      let profileDiv = document.getElementById("profile-div");
      if (profileDiv.style.display === "block") {
        profileDiv.style.display = "none";
        if (signInTooltip !== null) {
          signInTooltip.enable();
        }
      } else {
        profileDiv.style.display = "block";
        if (signInTooltip !== null) {
          signInTooltip.hide();
          signInTooltip.disable();
        }
      }
    },
    "profileImageButton"
  );

  Promise.all([stylePromise, graphPromise]).then(initCy).then(introSequence);

  updateQuestionAnswerUsers();

  function introSequence() {
    Promise.resolve(introPromise).then(function (slides) {
      let introSlides = slides;
      function showIntroIfNew() {
        if (
          isAnonymousUser(userId) &&
          localStorage.getItem("viewed_before") !== null &&
          !isMobile
        ) {
          showIntroTippy(introSlides);
        }
      }
      // TODO: if goal is set, zoom there instead of to the bottom?
      panByAndZoom(
        -cy.width() / 6,
        (-cy.height() * 4) / 9,
        1.5,
        showIntroIfNew
      );

      document.getElementById("open-intro").onclick = buttonPress(
        toggleIntro(introSlides),
        "open-intro"
      );
    });
  }

  logPageView();
}
