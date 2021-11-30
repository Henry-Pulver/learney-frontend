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
  let payload = { user_id: userId, map_uuid: mapUUID, session_id: sessionId };
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
        new URLSearchParams({ user_id: userId, map_uuid: mapUUID }),
      {
        method: "GET",
        headers: headers,
      }
    );
    if (response.status === 200) {
      const responseJson = await handleFetchResponses(response);
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
    handleFetchResponses(response);
  } else {
    for (const [url, vote] of Object.entries(object)) {
      const response = await fetch(getAPIEndpoint(backendUrl, name), {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          map_uuid: mapUUID,
          user_id: userId,
          session_id: sessionId,
          url: url,
          vote: vote,
        }),
      });
      handleFetchResponses(response);
    }
  }
}

export async function logPageView(user, backendUrl, mapUrlExtension) {
  let requestBody = {
    page_extension: mapUrlExtension,
  };
  if (user !== undefined) requestBody["user_id"] = user.user_id;
  const response = await fetch(`${backendUrl}/api/v0/page_visit`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(requestBody),
  });
  return await handleFetchResponses(response);
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
      map_uuid: mapUUID,
      user_id: userId,
      session_id: sessionId,
      url: url,
      concept_id: concept_id,
    }),
  });
  handleFetchResponses(response);
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
        button_name: buttonName,
      }),
    });
    handleFetchResponses(response);
  };
}

export async function handleFetchResponses(response) {
  let responseJson = await response.json();
  if (response.status === 200 || response.status === 201) {
    console.log(
      `Success! Status: ${response.status}\n${JSON.stringify(responseJson)}`
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
