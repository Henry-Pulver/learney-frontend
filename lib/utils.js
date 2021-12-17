import { headers, jsonHeaders } from "./headers";

export function isAnonymousUser(userId) {
  return userId.startsWith("anonymous-user|");
}

function isValidURL(str) {
  let a = document.createElement("a");
  a.href = str;
  return a.host && a.host !== window.location.host;
}

export function getValidURLs(urls) {
  let url_array = [];

  function validateURL(url) {
    url.replace(" ", "");
    if (url.length > 0) {
      url_array.push(url);
      if (!isValidURL(url)) {
        console.error(`The following URL is broken: ${url}`);
      }
    }
  }
  // Run validateURL on each url in the string
  urls.forEach(validateURL);

  return url_array;
}

function getAPIEndpoint(backendUrl, name) {
  let extension;
  if (name === "learnedNodes") {
    extension = "learned";
  } else if (name === "goalNodes") {
    extension = "goals";
  } else {
    extension = name;
  }
  return `${backendUrl}/api/v0/${extension}`;
}

function getGetResponseData(name, json) {
  let payload;
  if (name === "learnedNodes") {
    payload = json.learned_concepts;
  } else if (name === "goalNodes") {
    payload = json.goal_concepts;
  } else if (name === "votes") {
    payload = json;
  }
  return payload;
}

function getPostRequestData(name, objectToStore, userId, mapUUID, sessionId) {
  let payload = { user_id: userId, map: mapUUID, session_id: sessionId };
  if (name === "learnedNodes") {
    payload["learned_concepts"] = objectToStore;
  } else if (name === "goalNodes") {
    payload["goal_concepts"] = objectToStore;
  } else if (name === "votes") {
    payload["vote_urls"] = objectToStore;
  }
  return payload;
}

export async function initialiseFromStorage(backendUrl, name, userId, mapUUID) {
  console.log(`Initialising ${name} from storage!`);
  let apiEndpoint = getAPIEndpoint(backendUrl, name);

  if (!isAnonymousUser(userId)) {
    // Not stored locally, try DB
    const response = await fetch(
      `${apiEndpoint}?` +
        new URLSearchParams({ user_id: userId, map: mapUUID }),
      {
        method: "GET",
        headers: headers,
      }
    );
    if (response.status === 200) {
      const responseJson = await handleFetchResponses(response, backendUrl);
      return getGetResponseData(name, responseJson);
    }
  }
  return {};
}

export async function saveToDB(
  name,
  object,
  backendUrl,
  userId,
  mapUUID,
  sessionId
) {
  if (name !== "votes") {
    const response = await fetch(getAPIEndpoint(backendUrl, name), {
      method: "POST",
      body: JSON.stringify(
        getPostRequestData(name, object, userId, mapUUID, sessionId)
      ),
      headers: jsonHeaders,
    });
    handleFetchResponses(response, backendUrl);
  } else {
    for (const [url, vote] of Object.entries(object)) {
      const response = await fetch(getAPIEndpoint(backendUrl, name), {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          map: mapUUID,
          user_id: userId,
          session_id: sessionId,
          url: url,
          vote: vote,
        }),
      });
      handleFetchResponses(response, backendUrl);
    }
  }
}

export async function logPageView(user, backendUrl, mapUrlExtension) {
  let requestBody = {
    page_extension: mapUrlExtension,
  };
  if (user === undefined)
    requestBody["user_id"] = localStorage.getItem("userId");
  else requestBody["user_id"] = user.sub;

  const response = await fetch(`${backendUrl}/api/v0/page_visit`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(requestBody),
  });
  return await handleFetchResponses(response, backendUrl);
}

export async function logContentClick(
  url,
  concept_id,
  backendUrl,
  userId,
  mapUUID,
  sessionId
) {
  const response = await fetch(`${backendUrl}/api/v0/link_click`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({
      map: mapUUID,
      user_id: userId,
      session_id: sessionId,
      url: url,
      concept_id: concept_id,
    }),
  });
  handleFetchResponses(response, backendUrl);
}

export function buttonPress(runFirst, buttonName, backendUrl, userId) {
  if (typeof backendUrl !== "string" || backendUrl === "")
    console.error(
      `ButtonPress() backendUrl=${backendUrl} undefined at ${buttonName} press!`
    );
  return async function () {
    runFirst();
    const response = await fetch(`${backendUrl}/api/v0/button_press`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({
        user_id: userId,
        "Current URL": location.href,
        "Button Name": buttonName,
      }),
    });
    handleFetchResponses(response, backendUrl);
  };
}

export async function handleFetchResponses(response, backendUrl) {
  let responseJson = await response.json();
  if (response.status === 200 || response.status === 201) {
    if (backendUrl === "https://api.learney.me")
      console.log(`Success! Status: ${response.status}`);
    else
      console.log(
        `Success! Status: ${response.status}\n ${JSON.stringify(responseJson)}`
      );
  } else {
    console.error(
      `Unhappy response! Status: ${response.status} \n ${JSON.stringify(
        responseJson
      )}`
    );
  }
  return responseJson;
}

export function setURLQuery(router, queryParams) {
  delete router.query.x;
  delete router.query.y;
  delete router.query.zoom;
  delete router.query.topic;
  delete router.query.concept;
  router.push(
    {
      pathname: router.pathname,
      query: { ...router.query, ...queryParams },
    },
    undefined,
    { shallow: true }
  );
}

export function getOpacityEquivalentColour(
  foregroundColour,
  backgroundColour,
  foregroundOpacity
) {
  let fRGB, bRGB;
  if (foregroundColour.startsWith("rgb")) {
    fRGB = parseRGBString(foregroundColour);
  } else {
    fRGB = hexToRGB(foregroundColour);
  }
  if (backgroundColour.startsWith("rgb")) {
    bRGB = parseRGBString(backgroundColour);
  } else {
    bRGB = hexToRGB(backgroundColour);
  }
  const r = Math.floor(
    fRGB[0] * foregroundOpacity + bRGB[0] * (1 - foregroundOpacity)
  );
  const g = Math.floor(
    fRGB[1] * foregroundOpacity + bRGB[1] * (1 - foregroundOpacity)
  );
  const b = Math.floor(
    fRGB[2] * foregroundOpacity + bRGB[2] * (1 - foregroundOpacity)
  );
  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRGB(hex) {
  // Convert hex to RGB first
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 4) {
    r = "0x" + hex[1] + hex[1];
    g = "0x" + hex[2] + hex[2];
    b = "0x" + hex[3] + hex[3];
  } else if (hex.length === 7) {
    r = "0x" + hex[1] + hex[2];
    g = "0x" + hex[3] + hex[4];
    b = "0x" + hex[5] + hex[6];
  }
  return [r, g, b];
}

function parseRGBString(rgbString) {
  const rgb = rgbString
    .substring(4, rgbString.length - 1)
    .replace(/ /g, "")
    .split(",");
  return [Number(rgb[0]), Number(rgb[1]), Number(rgb[2])];
}
