import Profile from "./profile";
import buttonStyles from "../styles/buttons.module.css";
import mainStyles from "../styles/main.module.css";
import {
  FeedBackButton,
  MakeSuggestionButton,
  ResetLayoutButton,
  ResetPanButton,
  ResetProgressButton,
  RunDagreButton,
  SaveMapButton,
  SlackButton,
} from "./buttons";
import React, { useEffect } from "react";
import { setupTracking } from "../lib/trackingScripts";
import { setupSite } from "../lib/main";
import { useUser } from "@auth0/nextjs-auth0";
import {
  getButtonPressFunction,
  isAnonymousUser,
  logPageView,
} from "../lib/utils";
import IntroButtonInclTooltip from "../components/intro";
import { isMobile } from "../lib/graph";
import MapHeader from "./mapHeader";
// import SearchBar, {getSearchOptions} from "./search";

export default function MapPage({
  backendUrl,
  mapUrlExtension,
  allowSuggestions,
  editMap,
  mapJson,
  mapUUID,
}) {
  // SEARCH OPTIONS
  // const [searchOptions, setSearchOptions] = React.useState([]);
  // const updateSearchOptions = (elements) => setSearchOptions(getSearchOptions(elements));

  // POPUP VISIBLE
  // const [popupVisible, setPopupVisible] = React.useState(true);
  // const show = () => setPopupVisible(true);
  // const hide = () => setPopupVisible(false);

  const { user, error, isLoading } = useUser();
  const [userIdState, setUserIdState] = React.useState(undefined);
  const [userEmail, setUserEmail] = React.useState("");
  const [sessionId, setSessionId] = React.useState(null);

  const [introShown, setIntroShown] = React.useState(false);
  const showIntroTooltip = () => {
    setIntroShown(true);
  };
  const hideIntroTooltip = () => {
    setIntroShown(false);
  };

  const buttonPressFunction = getButtonPressFunction(
    backendUrl,
    userIdState,
    sessionId
  );

  useEffect(() => {
    (async function () {
      if (!isLoading) {
        let responseJson = await logPageView(user, backendUrl, mapUrlExtension);
        setSessionId(responseJson.session_id);

        let userId;
        if (user !== undefined) {
          userId = user.sub;
          setUserIdState(user.sub);
          setUserEmail(user.email);
        } else {
          userId = responseJson.user_id;
          setUserIdState(responseJson.user_id);
        }
        await setupSite(
          backendUrl,
          userId,
          allowSuggestions,
          editMap,
          mapJson,
          mapUUID,
          responseJson.session_id
          // updateSearchOptions
        );
        setupTracking();
        if (isAnonymousUser(userId) && !isMobile()) showIntroTooltip();
      }
    })();
  }, [isLoading]);

  return (
    <div>
      <MapHeader />

      <div id="cy" />

      <Profile buttonPressFunction={buttonPressFunction} userdata={user} />

      <div
        className={`${buttonStyles.topButtonToolbar} ${mainStyles.disableTouchActions}`}
      >
        <div className={buttonStyles.introButtonContainer}>
          {!editMap && (
            <IntroButtonInclTooltip
              introShown={introShown}
              hideIntroTooltip={hideIntroTooltip}
              showIntroTooltip={showIntroTooltip}
              buttonPressFunction={buttonPressFunction}
            />
          )}
          <MakeSuggestionButton
            allowSuggestions={allowSuggestions}
            buttonPressFunction={buttonPressFunction}
            userEmail={userEmail}
          />
        </div>
        <label id="concept-search-bar-label">
          {/*<SearchBar searchOptions={ searchOptions }/>*/}
          <select
            id={"concept-search-bar"}
            name="concept"
            style={{ width: "100%" }}
          />
        </label>
        <div className={buttonStyles.buttonToolbarDiv}>
          <SaveMapButton
            editMapEnabled={editMap}
            buttonPressFunction={buttonPressFunction}
            backendUrl={backendUrl}
            mapUUID={mapUUID}
          />
          <ResetLayoutButton
            buttonPressFunction={buttonPressFunction}
            userId={userIdState}
            editMap={editMap}
          />
          <RunDagreButton
            buttonPressFunction={buttonPressFunction}
            editMapEnabled={editMap}
          />
          <ResetProgressButton
            editMap={editMap}
            buttonPressFunction={buttonPressFunction}
            backendUrl={backendUrl}
            userId={userIdState}
            mapUUID={mapUUID}
            sessionId={sessionId}
          />
          <ResetPanButton buttonPressFunction={buttonPressFunction} />
        </div>
      </div>

      <div
        className={`${buttonStyles.feedbackButtons} ${mainStyles.disableTouchActions}`}
      >
        <FeedBackButton buttonPressFunction={buttonPressFunction} />
        {!editMap && <SlackButton buttonPressFunction={buttonPressFunction} />}
      </div>
    </div>
  );
}
