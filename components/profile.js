import React from "react";
import PropTypes from "prop-types";
import { signInTooltip } from "../lib/learningAndPlanning";
import mainStyles from "../styles/main.module.css";
import buttonStyles from "../styles/buttons.module.css";

Profile.propTypes = {
  userdata: PropTypes.object.isRequired,
  buttonPressFunction: PropTypes.func.isRequired,
};

export default function Profile({ userdata, buttonPressFunction }) {
  const [profileDivSelected, setValue] = React.useState(false);
  const onProfileSelected = buttonPressFunction(function () {
    if (signInTooltip !== null) {
      if (!profileDivSelected) {
        signInTooltip.enable();
      } else {
        signInTooltip.hide();
        signInTooltip.disable();
      }
    }
    setValue(!profileDivSelected);
  }, "profile-image-button");

  return (
    <div
      className={`overallProfileDiv ${mainStyles.disableTouchActions}`}
      onClick={onProfileSelected}
    >
      <div>
        <div id="profileImageButton">
          <img
            className={mainStyles.profileImage}
            src={userdata !== undefined ? userdata.picture : "/images/user.svg"}
            style={
              userdata !== undefined
                ? { backgroundColor: "transparent" }
                : { backgroundColor: "white" }
            }
            alt="Profile Picture"
          />
        </div>
      </div>
      <ProfileSelectedDiv
        userdata={userdata}
        profileDivSelected={profileDivSelected}
        buttonPressFunction={buttonPressFunction}
      />
    </div>
  );
}

function ProfileSelectedDiv({
  userdata,
  profileDivSelected,
  buttonPressFunction,
}) {
  return (
    <div
      id="profile-div"
      style={!profileDivSelected ? { display: "none" } : { display: "block" }}
    >
      {userdata !== undefined
        ? [
            <h2>Welcome, {userdata.name}!</h2>,
            <h5 className={mainStyles.profileEmail}>{userdata.email}</h5>,
            <LogOut buttonPressFunction={buttonPressFunction} />,
          ]
        : [
            <h2>Welcome!</h2>,
            <LogIn buttonPressFunction={buttonPressFunction} />,
          ]}
    </div>
  );
}

function LogOut({ buttonPressFunction }) {
  return (
    <button
      className={`${buttonStyles.button} px-2 py-1`}
      id="log-out"
      onClick={buttonPressFunction(function () {
        location.href = "/api/auth/logout";
      }, "log-out")}
    >
      Logout
    </button>
  );
}

function LogIn({ buttonPressFunction }) {
  return (
    <button
      id="log-in"
      className={`${buttonStyles.large} ${buttonStyles.button}`}
      onClick={buttonPressFunction(() => {
        location.href = "/api/auth/login";
      }, "log-in")}
    >
      Log In
    </button>
  );
}
