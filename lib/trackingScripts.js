import mixpanel from "mixpanel-browser";

export function setupTracking() {
  // Sorts out the Google Analytics & Hotjar tracking
  if (location.hostname.startsWith("app")) {
    enableHotjarTracking(); // Don't need this running on dev!
  } else if (location.hostname.startsWith("staging")) {
    enableHotjarTracking();
  }
}

function enableHotjarTracking() {
  (function (h, o, t, j, a, r) {
    h.hj =
      h.hj ||
      function () {
        (h.hj.q = h.hj.q || []).push(arguments);
      };
    h._hjSettings = { hjid: 2402210, hjsv: 6 };
    a = o.getElementsByTagName("head")[0];
    r = o.createElement("script");
    r.async = 1;
    r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
    a.appendChild(r);
  })(window, document, "https://static.hotjar.com/c/hotjar-", ".js?sv=");
}

export function initialiseMixpanelTracking(userData) {
  const debug = location.hostname !== "app.learney.me";
  mixpanel.init("865bae2d3a33195d687e6143e7a5fcde", { debug: debug });
  if (location.hostname === "app.learney.me") {
    if (userData !== undefined) {
      mixpanel.identify(userData.sub);
    }
    mixpanel.track("Page View");
  } else {
    mixpanel.opt_out_tracking();
  }
}
