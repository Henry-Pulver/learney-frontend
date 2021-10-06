import mainStyles from "../styles/main.module.css";
import buttonStyles from "../styles/buttons.module.css";
import React from "react";
import PropTypes from "prop-types";

Profile.propTypes = {
  userdata: PropTypes.object.isRequired,
};

export default function Profile({ userdata }) {
  return (
    <div
      className={`${mainStyles.overallProfileDiv} ${mainStyles.disableTouchActions}`}
    >
      <div>
        <div id="profileImageButton">
          {userdata.name !== "" ? (
            <img
              className={mainStyles.profileImage}
              src={userdata.picture}
              style={{ "background-color": "transparent" }}
              alt="Profile Picture"
            />
          ) : (
            <img
              className={mainStyles.profileImage}
              src="/images/user.svg"
              alt="Profile Picture"
            />
          )}
        </div>
      </div>
      {userdata.name !== "" ? (
        <div id="profile-div">
          <h2>Welcome, {userdata.name}!</h2>
          <h5 className={mainStyles.profileEmail}>{userdata.email}</h5>
          <button id="log-out">Logout</button>
        </div>
      ) : (
        <div id="profile-div">
          <h2>Welcome!</h2>
          <button
            id="log-in"
            className={`${buttonStyles.large} ${buttonStyles.flashing}`}
          >
            Log In
          </button>
        </div>
      )}
    </div>
  );
}
