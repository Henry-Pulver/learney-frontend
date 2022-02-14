import { cacheHeaders, headers, jsonHeaders } from "./headers";
import { UserState } from "./types";
import { ParsedUrlQuery } from "querystring";
import { EventObject } from "cytoscape";
import { NextRouter } from "next/router";
import { string } from "prop-types";

export function isAnonymousUser(userId: string): boolean {
  return userId.startsWith("anonymous-user|");
}

function isValidURL(str: string): boolean {
  const a = document.createElement("a");
  a.href = str;
  return a.host && a.host !== window.location.host;
}

export function getValidURLs(urls: Array<string>): Array<string> {
  const url_array = [];

  function validateURL(url: string) {
    url = url.replace(" ", "");
    if (url.length > 0) {
      if (!isValidURL(url)) {
        console.error(`The following URL is broken: ${url}`);
      } else url_array.push(url);
    }
  }
  // Run validateURL on each url in the string
  urls.forEach(validateURL);

  return url_array;
}

function getAPIEndpoint(backendUrl: string, name: string): string {
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

function getGetResponseData(name: string, json): object {
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

function getPostRequestData(
  name: string,
  objectToStore,
  userId: string,
  mapUUID: string,
  sessionId: string
): object {
  const payload = { user_id: userId, map: mapUUID, session_id: sessionId };
  if (name === "learnedNodes") {
    payload["learned_concepts"] = objectToStore;
  } else if (name === "goalNodes") {
    payload["goal_concepts"] = objectToStore;
  } else if (name === "votes") {
    payload["vote_urls"] = objectToStore;
  }
  return payload;
}

export async function initialiseFromStorage(
  backendUrl: string,
  name: string,
  userId: string,
  mapUUID: string
): Promise<object> {
  console.log(`Initialising ${name} from storage!`);
  const apiEndpoint = getAPIEndpoint(backendUrl, name);

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
  name: string,
  object: object,
  backendUrl: string,
  userId: string,
  mapUUID: string,
  sessionId: string
): Promise<void> {
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

export async function logPageView(
  user: UserState,
  backendUrl: string,
  mapUrlExtension: string
): Promise<object> {
  const requestBody = {
    page_extension: mapUrlExtension,
  };
  if (user === undefined)
    requestBody["user_id"] = localStorage.getItem("userId");
  else {
    requestBody["user_id"] = user.sub;
    requestBody["user_data"] = user;
  }

  const response = await fetch(`${backendUrl}/api/v0/page_visit`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(requestBody),
  });
  return await handleFetchResponses(response, backendUrl);
}

export async function logContentClick(
  url: string,
  concept_id: number,
  backendUrl: string,
  userId: string,
  mapUUID: string,
  sessionId: string
): Promise<void> {
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

export const fetchTotalVotes = async ({
  backendUrl,
  mapUUID,
  editMap,
}: {
  backendUrl: string;
  mapUUID: string;
  editMap: boolean;
}): Promise<object> => {
  if (!editMap) {
    const response = await fetch(
      `${backendUrl}/api/v0/total_vote_count?` +
        new URLSearchParams({ map: mapUUID }),
      {
        method: "GET",
        headers: cacheHeaders,
      }
    );
    if (!response.ok) throw new Error(response.status.toString());
    return handleFetchResponses(response, backendUrl);
  } else {
    return {};
  }
};

export function buttonPress(
  runFirst: (...args: any) => void,
  buttonName: string,
  backendUrl: string,
  userId: string
): (...args: any) => void {
  if (typeof backendUrl !== "string" || backendUrl === "")
    throw new Error(
      `ButtonPress() backendUrl=${backendUrl} undefined at ${buttonName} press!`
    );
  if (typeof userId !== "string" || userId === "")
    throw new Error(
      `userId=${userId} not well defined at ${buttonName} press!`
    );
  return async (...args: any) => {
    runFirst(...args);
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

export async function trackCyEvent(
  event: EventObject,
  eventType: string,
  backendUrl: string,
  userId: string,
  extraParams: object = {}
) {
  const eventData = {
    user_id: userId,
    "Current URL": location.href,
    "Event Type": eventType,
    Position: event.position,
    ...extraParams,
  };
  if (event.target !== window.cy) {
    // Use id as a backup in case there is no name
    eventData["Event Target"] = event.target.data().name || event.target.id();
  }
  const response = await fetch(`${backendUrl}/api/v0/cytoscape_events`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(eventData),
  });
  handleFetchResponses(response, backendUrl);
}

export async function handleFetchResponses(
  response: Response,
  backendUrl: string
): Promise<object> {
  const responseJson = await response.json();
  if (response.status > 199 && response.status < 300) {
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

export function setURLQuery(
  router: NextRouter,
  newParams: ParsedQuery,
  deleteParam?: string
): void {
  const q = router.query;
  console.log(newParams);
  if (
    q.x !== newParams.x ||
    q.y !== newParams.y ||
    q.zoom !== newParams.zoom ||
    q.topic !== newParams.topic ||
    q.concept !== newParams.concept ||
    newParams.quemodal
  ) {
    delete router.query.x;
    delete router.query.y;
    delete router.query.zoom;
    delete router.query.topic;
    delete router.query.quemodal;
    if (!deleteParam) {
      delete router.query.concept;
    }
    if (deleteParam) {
      deleteParam === queryParams.CONCEPT
        ? delete router.query.concept
        : delete router.query.quemodal;
    }
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, ...newParams },
      },
      undefined,
      { shallow: true }
    );
  }
}

export function getOpacityEquivalentColour(
  foregroundColour: string,
  backgroundColour: string,
  foregroundOpacity: number
): string {
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

function hexToRGB(hex: string): Array<string> {
  // Convert hex to RGB first
  let r = "",
    g = "",
    b = "";
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

function parseRGBString(rgbString: string): Array<number> {
  const rgb = rgbString
    .substring(4, rgbString.length - 1)
    .replace(/ /g, "")
    .split(",");
  return [Number(rgb[0]), Number(rgb[1]), Number(rgb[2])];
}

export function URLQuerySet(query: ParsedUrlQuery): boolean {
  const queriesSet: boolean =
    !!query.topic || !!query.concept || !!query.x || !!query.y || !!query.zoom;

  // Either a topic, a concept or a position & zoom should be set. Not 2 or more
  const positionSet = query.x || query.y || query.zoom;
  if (
    (query.topic && query.concept) ||
    (query.topic && positionSet) ||
    (query.concept && positionSet)
  )
    new Error(`Invalid query - more than one query parameter set: ${query}`);

  // If only one set, check it's set validly
  if (query.topic && typeof query.topic !== "string")
    new Error(`${query.topic} is an invalid query!`);
  if (query.concept && typeof query.concept !== "string")
    new Error(`${query.concept} is an invalid query!`);

  const allPositionSet = query.x && query.y && query.zoom;
  if (positionSet && !allPositionSet)
    new Error(`${query.topic} is an invalid query!`);
  else {
    if (
      !(
        typeof query.x !== "number" &&
        typeof query.y !== "number" &&
        typeof query.zoom !== "number"
      )
    )
      new Error(
        `Not all of x, y & zoom parameters are set as numbers! (x: ${query.x}, y: ${query.y}, zoom: ${query.zoom})`
      );
  }
  return queriesSet;
}

type ParsedQuery = {
  topic?: string;
  concept?: string;
  x?: string;
  y?: string;
  zoom?: string;
  quemodal?: boolean;
};

export function parseQuery(query: ParsedUrlQuery): ParsedQuery {
  if (query.topic && typeof query.topic === "string")
    return { topic: query.topic };
  if (query.concept && typeof query.concept === "string")
    return { concept: query.concept };
  if (
    query.x &&
    typeof query.x === "string" &&
    typeof query.y === "string" &&
    typeof query.zoom === "string"
  )
    return { x: query.x, y: query.y, zoom: query.zoom };
}

export function isEven(integer: number): boolean {
  return integer % 2 === 0;
}

export function isNumeric(num: string): boolean {
  return !isNaN(+num);
}

export enum queryParams {
  "CONCEPT" = "concept",
  "QUEMODAL" = "quemodal",
}
