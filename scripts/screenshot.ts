// scripts/screenshot.ts
// Screenshot the running site with the sawmill canvas rendered.
//
//   npm run shot -- <name> [--url <url>] [--scroll <px>] [--step <P>] [--width <px>] [--height <px>]
//                          [--canvas] [--frame] [--compare] [--reference <png>]
//
// Saves docs/screenshots/<name>.png. Needs the dev server running (npm run dev).
//   --step     scroll the page so the hero timeline sits at progress P
//              (0 = top, n = all planks stacked), then wait for it to settle
//   --canvas   capture only the canvas element instead of the viewport
//   --frame    pin the canvas to the full viewport, sized to the reference's
//              aspect ratio (master.png: 1376x768) so it lines up with it;
//              implies --canvas
//   --compare  also save <name>-compare.png: the reference and the render side
//              by side, with a 50% blend and a difference image underneath
//   --reference  reference image for --frame/--compare (default references/master.png)
//   --webp <path>  also save the capture as WebP (used for the hero fallback image)
//
// Dev-only query params on the page (pass them in --url):
//   ?sawmill-lab=pose:<name> | turnaround:<front|side|back|threeQuarter>
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { chromium } from "playwright";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    url: { type: "string", default: "http://localhost:3000/" },
    scroll: { type: "string" },
    step: { type: "string" },
    width: { type: "string" },
    height: { type: "string" },
    canvas: { type: "boolean", default: false },
    frame: { type: "boolean", default: false },
    compare: { type: "boolean", default: false },
    reference: { type: "string", default: "references/master.png" },
    webp: { type: "string" },
  },
});

const reference = await readFile(values.reference!);
// PNG header: width and height are big-endian uint32 at bytes 16 and 20.
const refW = reference.readUInt32BE(16);
const refH = reference.readUInt32BE(20);
// Small references are scaled up so the frame stays at least 768 tall.
const refScale = Math.max(1, 768 / refH);

const name = positionals[0] ?? "sawmill";
const outDir = "docs/screenshots";
const outPath = `${outDir}/${name}.png`;
const width = Number(values.width ?? (values.frame ? Math.round(refW * refScale) : 1440));
const height = Number(values.height ?? (values.frame ? Math.round(refH * refScale) : 900));

const browser = await chromium.launch({
  // Headless Chromium has no GPU; allow the software WebGL fallback.
  args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"],
});

try {
  const page = await browser.newPage({ viewport: { width, height } });

  // Skip the first-visit loader overlay (components/TheLoader.vue).
  await page.addInitScript(() => sessionStorage.setItem("seen-loader", "1"));

  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await page.goto(values.url!, { waitUntil: "load" });

  const canvas = page.locator("[data-sawmill-canvas]").first();
  await canvas.waitFor({ state: "visible", timeout: 30_000 });

  if (values.scroll) {
    await page.evaluate((y) => window.scrollTo(0, y), Number(values.scroll));
  }
  if (values.step) {
    // Same mapping as SawmillCanvas: progress = -top / (height - viewport) * steps.
    await page.evaluate((step) => {
      const section = document.querySelector<HTMLElement>("[data-sawmill-scroll]")!;
      const steps = Number(getComputedStyle(section).getPropertyValue("--sawmill-steps"));
      const top = section.getBoundingClientRect().top + window.scrollY;
      const scrollable = section.offsetHeight - window.innerHeight;
      window.scrollTo(0, top + (Math.min(step, steps) / steps) * scrollable);
    }, Number(values.step));
    // Let the damped progress catch up with the scroll.
    await page.waitForTimeout(2500);
  }

  if (values.frame) {
    // Lift the canvas out of the page (its ancestors are transformed by the
    // entrance animation, which would trap position:fixed) and hide the rest.
    await page.evaluate(() => {
      const root = document.querySelector<HTMLElement>("[data-sawmill-root]")!;
      document.body.appendChild(root);
      for (const el of Array.from(document.body.children)) {
        if (el !== root) (el as HTMLElement).style.visibility = "hidden";
      }
      Object.assign(root.style, { position: "fixed", inset: "0", width: "100vw", height: "100vh", zIndex: "2147483647" });
    });
  }


  // Let the entrance animation, resize and font loading settle, then a few frames.
  await page.waitForTimeout(2000);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let frames = 0;
        const tick = () => (++frames >= 5 ? resolve() : requestAnimationFrame(tick));
        requestAnimationFrame(tick);
      }),
  );

  await mkdir(outDir, { recursive: true });
  const shot = values.canvas || values.frame
    ? await canvas.screenshot({ path: outPath })
    : await page.screenshot({ path: outPath });
  console.log(`Saved ${outPath}`);

  if (values.webp) {
    const webpUrl = await page.evaluate(async (png) => {
      const img = new Image();
      img.src = `data:image/png;base64,${png}`;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      c.getContext("2d")!.drawImage(img, 0, 0);
      return c.toDataURL("image/webp", 0.86);
    }, shot.toString("base64"));
    await writeFile(values.webp, Buffer.from(webpUrl.split(",")[1]!, "base64"));
    console.log(`Saved ${values.webp}`);
  }

  if (values.compare) {
    const comparePath = `${outDir}/${name}-compare.png`;
    const dataUrl = await page.evaluate(
      async ({ ref, render }) => {
        const load = async (b64: string) => {
          const img = new Image();
          img.src = `data:image/png;base64,${b64}`;
          await img.decode();
          return img;
        };
        const [a, b] = await Promise.all([load(ref), load(render)]);
        // Work at the render's size; the reference is scaled to match.
        const w = b.width, h = b.height;
        const c = document.createElement("canvas");
        c.width = w * 2;
        c.height = h * 2;
        const g = c.getContext("2d")!;
        g.fillStyle = "#fff";
        g.fillRect(0, 0, c.width, c.height);
        // Top: reference | render. Bottom: 50% blend | difference.
        g.drawImage(a, 0, 0, w, h);
        g.drawImage(b, w, 0, w, h);
        g.drawImage(a, 0, h, w, h);
        g.globalAlpha = 0.5;
        g.drawImage(b, 0, h, w, h);
        g.globalAlpha = 1;
        g.drawImage(a, w, h, w, h);
        g.globalCompositeOperation = "difference";
        g.drawImage(b, w, h, w, h);
        g.globalCompositeOperation = "source-over";
        g.font = "bold 22px sans-serif";
        g.fillStyle = "#c00";
        [["reference", 0, 0], ["render", w, 0], ["blend 50%", 0, h], ["difference", w, h]].forEach(
          ([label, x, y]) => g.fillText(label as string, (x as number) + 16, (y as number) + 32),
        );
        return c.toDataURL("image/png");
      },
      { ref: reference.toString("base64"), render: shot.toString("base64") },
    );
    await writeFile(comparePath, Buffer.from(dataUrl.split(",")[1]!, "base64"));
    console.log(`Saved ${comparePath}`);
  }

  if (errors.length) {
    console.warn(`Page errors:\n  ${errors.join("\n  ")}`);
  }
} finally {
  await browser.close();
}
