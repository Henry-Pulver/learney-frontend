import { parse } from "node-html-parser";

const API_KEY = "155ae906acdaba12406ba0";
export default async function handler(req, res) {
  try {
    const { contentURL } = req.body;
    const response = await fetch(
      `https://iframe.ly/api/oembed?url=${contentURL}&api_key=${API_KEY}`
    );
    const resJson = await response.json();
    const htmlString = resJson.html;
    const documentModel = parse(htmlString);
    const iframeElement = documentModel.getElementsByTagName("iframe");
    if (iframeElement && iframeElement.length > 0) {
      const iframeURL = iframeElement[0].getAttribute("src");
      return res.status(200).json({ url: iframeURL , type:resJson.type});
    }
    return res.status(200).json({ url: "" , type:''});
  } catch (err) {
    console.warn("Error at /pages/api/iframe/url endpoint", err.message);
    throw err;
  }
}
