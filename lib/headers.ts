export var headers;
export var jsonHeaders;
export var cacheHeaders;

headers = new Headers();
headers.append("Accept", "application/json, text/plain, */*");

jsonHeaders = headers.valueOf();
jsonHeaders.append("Content-Type", "application/json");

cacheHeaders = jsonHeaders.valueOf();
cacheHeaders.append("Cache-Control", "max-age=604800");
