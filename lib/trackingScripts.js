import mixpanel from "mixpanel-browser";

export function setupTracking() {
  // Sorts out Hotjar tracking
  if (
    location.hostname.startsWith("app") ||
    location.hostname.startsWith("staging")
  ) {
    enableHotjarTracking(); // Don't need this running on dev!
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

export function initialiseMixpanelTracking(userId) {
  const debug = location.hostname !== "app.learney.me";
  mixpanel.init("865bae2d3a33195d687e6143e7a5fcde", { debug: debug });
  mixpanel.opt_in_tracking();
  if (location.hostname === "app.learney.me") {
    mixpanel.identify(userId);
    mixpanel.track("Page View");
  } else {
    mixpanel.opt_out_tracking();
  }
}
