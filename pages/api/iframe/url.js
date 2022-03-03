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
      console.log(iframeURL);
      return res.status(200).json({ url: iframeURL });
    }
    return res.status(200).json({ url: "" });
  } catch (err) {
    console.log("Erro at /pages/api/iframe/url endppooint", err.message);
    throw err;
  }
}
