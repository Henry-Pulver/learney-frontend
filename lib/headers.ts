export var headers;
export var jsonHeaders;
export var cacheHeaders;

headers = new Headers();
headers.append("accept", "application/json, text/plain, */*");

jsonHeaders = headers.valueOf();
jsonHeaders.append("content-type", "application/json");

cacheHeaders = jsonHeaders.valueOf();
cacheHeaders.append("Cache-Control", "max-age=604800");
