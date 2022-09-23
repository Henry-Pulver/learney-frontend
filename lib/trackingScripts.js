import mixpanel from "mixpanel-browser";
import * as Sentry from "@sentry/nextjs";

export function setupTracking() {
  // Sorts out Hotjar tracking - only need on production
  if (location.hostname.startsWith("maps")) {
    enableHotjarTracking();
  }

  Sentry.init({
    dsn: "https://bc60f04d032e4ea590973ebc6d8db2f5@o1080536.ingest.sentry.io/6086500",
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
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

export function initialiseMixpanelTracking(userId, user) {
  const debug = location.hostname !== "maps.joindeltaacademy.com";
  mixpanel.init("865bae2d3a33195d687e6143e7a5fcde", { debug: debug });
  if (location.hostname === "maps.joindeltaacademy.com") {
    mixpanel.opt_in_tracking();
    mixpanel.identify(userId);
    // On first sign-in
    if (
      user !== undefined &&
      localStorage.getItem("userId") &&
      !localStorage.getItem("notFirstSignIn")
    ) {
      mixpanel.alias(user.sub, localStorage.getItem("userId"));
      mixpanel.people.set_once({ "First Sign In Date": new Date() });
      mixpanel.people.set({
        Name: user.name,
        Email: user.email,
        "Email Verified": user.email_verified,
        "Locale String": user.locale,
        ID: user.sub,
      });
      localStorage.setItem("notFirstSignIn", "true");
    }
    mixpanel.track("Page View");
  } else {
    mixpanel.opt_out_tracking();
  }
}
