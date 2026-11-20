import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const MISSING = "Amma hasn’t recorded this one yet";

const LYRICS = {
  "aane-banthondu-aane": [
    "Aane banthondu aane",
    "Yaavooraane?",
    "Bijaapuradaane",
    "Illige yaake bantu?",
    "Daari tappi bantu",
    "Kobri bella tantu",
    "Makkaligellaa hanchtu",
    "Aane oodi hoytu",
  ],
  "nayi-mari-nayi-mari": [
    "Nayimari nayimari tindi beke?",
    "Tindi beku teertha beku ella beku",
    "Nayimari ninage tindi eke beku?",
    "Tindu gattiyaagi maneya kaayabeku",
    "Nayimari kaLLa bandarenu maaduve?",
    "LoL loL bau endu koogi aaduve",
    "Jaanamari taaLu hogi tindi taruvenu",
    "Taa ninna maneya naanu kaayutiruvenu",
  ],
  "ondu-eradu-baalele-haradu": [
    "Ondu eradu baaleLe haradu",
    "Mooru naalku anna haaku",
    "Aidu aaru beLe saaru",
    "EeLu entu paLyake dantu",
    "Ombattu hattu ele mudurettu",
    "Ondarinda hattu heegittu",
    "Ootada aatavu mugidittu",
  ],
  "karadi-bettakke-hoyithu": [
    "Karadi bettakke hoyitu",
    "Karadi bettakke hoyitu",
    "Karadi bettakke hoyitu",
    "Nota nodalu",
    "Noditenaadu?",
    "Noditenaadu?",
    "Bettada innondu bhaaga",
    "Bettada innondu bhaaga",
    "Karadi noditu",
    "Halasu tanditu",
    "Jenu kalasitu",
    "MarigaLige tinnisi",
    "Taanu tindu teegitu",
  ],
  "chandamama-odi-baa": [
    "Chandamama oodi baa",
    "Chandadinda aadu baa",
    "Bandu odanaadu baa",
    "Munde munde oodi baa",
    "Sakkare kaddi tartini",
    "Mikkare ninguu kodtini",
    "Nakkare naanu nagtini",
    "Attare naanu aLtini",
    "Ellige hodaru bartiiyaa",
    "Allee dooradali irtiiyaa",
    "Mellage sannage aagtiiyaa",
    "Hinde munde hogtiiyaa",
    "Chandamama oodi baa",
    "Chandadinda aadu baa",
  ],
  "tarakka-bindige": [
    "Tarakka bindige naa neerige hoguve",
    "Taare bindigeya",
    "Bindige odedare onde kaasu",
    "Taare bindigeya",
    "Govinda embo gunavuLLa neerige",
    "Taare bindigeya",
    "Aavaava pariyali amrutada paanake",
    "Taare bindigeya",
    "Bindu Maadhavana ghattakke hoguve",
    "Taare bindigeya",
    "Purandara ViTThalage abhisheka maaduve",
    "Taare bindigeya",
  ],
};

function trackErrors(page) {
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (/Failed to load resource|404|net::ERR/i.test(text)) return;
    errors.push(text);
  });
  return errors;
}

async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    const pending = document.getAnimations().filter((anim) => {
      const timing = anim.effect && anim.effect.getTiming();
      return timing && timing.iterations !== Infinity;
    });
    await Promise.all(pending.map((anim) => anim.finished.catch(() => {})));
  });
  await page.waitForFunction(() => {
    const visible = [...document.images].filter((img) => img.getBoundingClientRect().width > 0);
    return visible.length > 0 && visible.every((img) => img.complete && img.naturalWidth > 0);
  });
}

async function expectLayout(page) {
  await settle(page);
  const problems = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const problems = [];
    if (document.documentElement.scrollWidth > width + 1) {
      problems.push(`page scrolls sideways (${document.documentElement.scrollWidth} > ${width})`);
    }
    for (const el of document.body.querySelectorAll("*")) {
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;
      const box = el.getBoundingClientRect();
      if (box.width < 1 && box.height < 1) continue;
      if (box.right > width + 1.5 || box.left < -1.5) {
        const name = `${el.tagName}.${String(el.className).slice(0, 40)}`;
        problems.push(`${name} sticks out (${box.left.toFixed(1)}–${box.right.toFixed(1)})`);
      }
    }
    for (const img of document.querySelectorAll("img")) {
      const box = img.getBoundingClientRect();
      if (box.width < 1) continue;
      const fit = getComputedStyle(img).objectFit;
      if (fit !== "contain") problems.push(`object-fit is ${fit}`);
      if (!img.complete || !img.naturalWidth) problems.push(`image not loaded: ${img.currentSrc}`);
      const ratio = img.naturalWidth / img.naturalHeight;
      if (Math.abs(ratio - 4 / 3) > 0.01) problems.push(`image is not 4:3 (${ratio})`);
      const scale = Math.min(box.width / img.naturalWidth, box.height / img.naturalHeight);
      const drawnW = img.naturalWidth * scale;
      const drawnH = img.naturalHeight * scale;
      if (drawnW > box.width + 1 || drawnH > box.height + 1) problems.push("image draws outside its box");
    }
    if (/[\u0C80-\u0CFF]/.test(document.body.innerText)) problems.push("Kannada script is on the page");
    for (const badge of document.querySelectorAll(".more-item .badge")) {
      const thumb = badge.closest(".thumb");
      if (!thumb) {
        problems.push("recording mark is not on a thumbnail");
        continue;
      }
      const frame = thumb.getBoundingClientRect();
      const mark = badge.getBoundingClientRect();
      const cx = mark.left + mark.width / 2;
      const cy = mark.top + mark.height / 2;
      if (cx < frame.left - 4 || cx > frame.right + 4 || cy < frame.top - 4 || cy > frame.bottom + 4) {
        problems.push("recording mark sits off its thumbnail");
      }
    }
    return problems.slice(0, 12);
  });
  expect(problems, problems.join("\n")).toEqual([]);
}

test("every rhyme, every screen, stays on the phone", async ({ page }) => {
  test.setTimeout(60_000);
  const errors = trackErrors(page);
  await page.goto("/");
  await expect(page.getByText(MISSING).first()).toBeVisible();
  await expect(page.locator("iframe, a[href*='youtube']")).toHaveCount(0);

  const sung = await page.evaluate(() => window.RHYMES.map((rhyme) => ({
    id: rhyme.id,
    lines: rhyme.chunks.flat().map((row) => row.parts
      .map((part) => (part.br ? " " : part.blank || part.text || ""))
      .join("")
      .replace(/\s+/g, " ")
      .trim()),
  })));
  for (const rhyme of sung) {
    expect(rhyme.lines, rhyme.id).toEqual(LYRICS[rhyme.id]);
  }

  for (const id of Object.keys(LYRICS)) {
    await page.evaluate((rhymeId) => {
      localStorage.setItem("samaya-kannada-rhymes", JSON.stringify({ rhymeId, step: "hear" }));
    }, id);
    await page.reload();
    const englishTitle = await page.evaluate((rhymeId) => window.RHYMES.find((item) => item.id === rhymeId).english, id);
    for (const tab of ["Week", "Sing", "Words", "Story"]) {
      await page.getByRole("tab", { name: tab }).click();
      await expect(page.locator(`[data-view="${tab.toLowerCase()}"]`)).toBeVisible();
      await expect(page.getByText(englishTitle, { exact: true })).toHaveCount(0);
      await expectLayout(page);
    }
  }

  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("tab", { name: "Words" }).click();
  const clap = page.locator(".clap").first();
  await clap.click();
  await expect.poll(() => clap.evaluate((el) => el.getAnimations().some((anim) => anim.effect && anim.effect.getTiming().duration === 480))).toBe(true);
  await page.locator(".twin").first().click();
  await expect(page.locator(".twin.is-pop").first()).toBeVisible();
  await page.getByRole("tab", { name: "Sing" }).click();
  await page.locator(".blank").first().click({ force: true });
  await expect(page.locator(".blank.is-filled").first()).toBeVisible();
  await page.getByRole("button", { name: "Next lines" }).click();
  await expect(page.getByText("Part 2 of")).toBeVisible();
  await page.getByRole("tab", { name: "Story" }).click();
  await page.locator(".answer-chip").click();
  await page.getByRole("tab", { name: "Week" }).click();
  await page.getByRole("radio", { name: "Lead" }).click();
  await expect(page.getByRole("radio", { name: "Lead" })).toHaveAttribute("aria-checked", "true");
  await page.reload();
  await expect(page.getByRole("radio", { name: "Lead" })).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "All 6" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".pick")).toHaveCount(6);
  await expectLayout(page);
  expect(errors, errors.join("\n")).toEqual([]);
});

test("motion stays still when reduced motion is on", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("tab", { name: "Words" }).click();
  const clap = page.locator(".clap").first();
  await clap.click();
  const sprang = await clap.evaluate((el) => el.getAnimations().some((anim) => anim.effect && anim.effect.getTiming().duration === 480));
  expect(sprang).toBe(false);
});

test("a dropped recording can play, and a chunk can pause", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "iphone-14", "one phone is enough for audio");
  const silence = "/tmp/samaya-silence.mp3";
  execFileSync("ffmpeg", ["-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", "3", "-q:a", "9", silence], { stdio: "ignore" });
  await page.route("**/audio/**", async (route) => {
    const url = route.request().url();
    if (url.includes("aane-banthondu-aane.mp3")) {
      await route.fulfill({ status: 200, contentType: "audio/mpeg", body: fs.readFileSync(silence) });
      return;
    }
    await route.fulfill({ status: 404, body: "missing" });
  });
  await page.goto("/");
  await expect(page.locator("#missingNote")).toBeHidden();
  await page.getByRole("button", { name: "Play Amma’s voice" }).click();
  await expect(page.getByRole("button", { name: "Pause Amma’s voice" })).toBeVisible();
  await page.getByRole("tab", { name: "Sing" }).click();
  await page.evaluate(() => {
    window.RHYMES[0].audioChunks = [{ start: 0, end: 2.5, pauseAt: 0.6 }];
  });
  await page.locator("#chunkBtn").click();
  await expect(page.locator("#chunkStatus")).toHaveText("Playing — will pause at the blank");
  await expect(page.locator("#chunkStatus")).toHaveText("Paused at the blank for Samaya", { timeout: 8000 });
});

test("whole rhyme lists every verified line", async ({ page }) => {
  test.setTimeout(90_000);
  const whole = JSON.parse(fs.readFileSync(new URL("../data/whole-rhymes.json", import.meta.url), "utf8"));
  const errors = trackErrors(page);
  await page.goto("/");
  for (const pack of whole) {
    await page.evaluate((rhymeId) => {
      localStorage.setItem("samaya-kannada-rhymes", JSON.stringify({ rhymeId, step: "hear" }));
    }, pack.id);
    await page.reload();
    for (const tab of ["Week", "Sing"]) {
      await page.getByRole("tab", { name: tab }).click();
      await page.getByRole("button", { name: "See whole rhyme" }).click();
      const dialog = page.getByRole("dialog", { name: "Whole rhyme" });
      await expect(dialog).toBeVisible();
      const rows = dialog.locator("[data-whole-line]");
      await expect(rows, pack.id).toHaveCount(pack.lines.length);
      const texts = (await rows.locator(".whole-text").allTextContents()).map((text) => text.trim());
      expect(texts, pack.id).toEqual(pack.lines.map((line) => line.text));
      const sizes = await dialog.locator(".whole-text").evaluateAll((nodes) => (
        nodes.map((node) => Number.parseFloat(getComputedStyle(node).fontSize))
      ));
      expect(Math.min(...sizes)).toBeGreaterThanOrEqual(18);
      const sheet = await dialog.innerText();
      expect(sheet).not.toMatch(/[\u0C80-\u0CFF]/);
      for (const line of pack.lines) {
        expect(sheet).not.toContain(line.mean);
      }
      await expect(page.getByText(pack.lines[0].mean, { exact: true })).toHaveCount(0);
      await expectLayout(page);
      await dialog.getByRole("button", { name: "Close" }).click();
      await expect(dialog).toBeHidden();
    }
  }
  expect(errors, errors.join("\n")).toEqual([]);
});

test("iphone 14 screenshots", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "iphone-14");
  const dir = "/opt/cursor/artifacts";
  await page.goto("/");
  await settle(page);
  await page.screenshot({ path: `${dir}/iphone14-week.png`, fullPage: false });

  await page.getByRole("button", { name: "Nayimari", exact: true }).click();
  await page.getByRole("tab", { name: "Sing" }).click();
  await settle(page);
  await page.screenshot({ path: `${dir}/iphone14-sing.png`, fullPage: false });

  await page.getByRole("tab", { name: "Week" }).click();
  await page.getByRole("button", { name: "All 6" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await settle(page);
  await page.screenshot({ path: `${dir}/iphone14-picker.png`, fullPage: false });
  await page.getByRole("dialog").getByRole("button", { name: /Aane Banthondu Aane/ }).click();

  await page.getByRole("tab", { name: "Words" }).click();
  await settle(page);
  await page.screenshot({ path: `${dir}/iphone14-words.png`, fullPage: false });

  await page.getByRole("tab", { name: "Story" }).click();
  await settle(page);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${dir}/iphone14-story.png`, fullPage: false });

  await page.getByRole("tab", { name: "Week" }).click();
  await page.getByRole("button", { name: "See whole rhyme" }).click();
  const aaneSheet = page.getByRole("dialog", { name: "Whole rhyme" });
  await expect(aaneSheet).toBeVisible();
  await aaneSheet.evaluate(async (el) => {
    await Promise.all(el.getAnimations({ subtree: true }).map((anim) => anim.finished));
  });
  await page.screenshot({ path: `${dir}/iphone14-whole-aane.png`, fullPage: false });
  await aaneSheet.getByRole("button", { name: "Close", exact: true }).click();

  await page.getByRole("button", { name: "All 6" }).click();
  await page.getByRole("dialog").getByRole("button", { name: /Nayimari Nayimari/ }).click();
  await page.getByRole("button", { name: "See whole rhyme" }).click();
  const ziggySheet = page.getByRole("dialog", { name: "Whole rhyme" });
  await expect(ziggySheet).toBeVisible();
  await ziggySheet.evaluate(async (el) => {
    await Promise.all(el.getAnimations({ subtree: true }).map((anim) => anim.finished));
  });
  await page.screenshot({ path: `${dir}/iphone14-whole-nayimari.png`, fullPage: false });
});
