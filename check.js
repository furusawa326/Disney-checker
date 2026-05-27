const { chromium } = require("playwright");
const axios = require("axios");

const URL =
  "https://jubilee-gala.tokyodisneyresort.jp/module/ticket/423426?ticketLargeCategoryId=16595";

const TARGET_DATE = "5/30";

const WEBHOOK = process.env.DISCORD_WEBHOOK;

async function notify(message) {
  await axios.post(WEBHOOK, {
    content: message,
  });
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage();

  await page.goto(URL, {
    waitUntil: "networkidle",
  });

  await page.waitForTimeout(5000);

  const found = await page.evaluate((targetDate) => {
    const text = document.body.innerText;

    const lines = text.split("\n");

    for (const line of lines) {
      if (
        line.includes(targetDate) &&
        (line.includes("△") || line.includes("○"))
      ) {
        return line;
      }
    }

    return null;
  }, TARGET_DATE);

  if (found) {
    await notify(
      `🎉 5/30 に空きが出ました！\n${found}\n${URL}`
    );
  }

  await browser.close();
})();
