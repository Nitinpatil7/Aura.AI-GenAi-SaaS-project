const cloudinary = require("../config/cloudinary");
const { HfInference } = require("@huggingface/inference");
const { withTimeout } = require("../utils/aihelpers");

const hf = new HfInference(process.env.HF_API_KEY);

const DEFAULT_IMAGE_MODEL = "stabilityai/stable-diffusion-xl-base-1.0";
const IMAGE_MODEL = process.env.HF_IMAGE_MODEL || DEFAULT_IMAGE_MODEL;
const IMAGE_ENDPOINT =
  process.env.HF_IMAGE_ENDPOINT ||
  `https://api-inference.huggingface.co/models/${IMAGE_MODEL}`;
const IMAGE_TIMEOUT_MS = Number(process.env.HF_IMAGE_TIMEOUT_MS || 15000);
const IMAGE_RETRIES = Number(process.env.HF_IMAGE_RETRIES || 1);
const POLLINATIONS_TIMEOUT_MS = Number(process.env.POLLINATIONS_TIMEOUT_MS || 20000);
const CLOUDINARY_UPLOAD_TIMEOUT_MS = Number(process.env.CLOUDINARY_UPLOAD_TIMEOUT_MS || 15000);

const aspectMap = {
  "1:1": { width: 1024, height: 1024 },
  "16:9": { width: 1344, height: 768 },
  "9:16": { width: 768, height: 1344 },
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(error) {
  const message = `${error?.message || ""} ${error?.cause?.code || ""}`;
  return /fetch failed|timeout|aborted|UND_ERR|ECONN|ETIMEDOUT|503|504|429/i.test(
    message,
  );
}

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function createFallbackImage(prompt, aspect) {
  const size = aspectMap[aspect] || aspectMap["1:1"];
  const title = escapeXml(prompt).slice(0, 90);
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}" viewBox="0 0 ${size.width} ${size.height}">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#6d28d9"/>
      <stop offset="48%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#14b8a6"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.32"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>
  <g fill="none" stroke="#ffffff" stroke-opacity="0.22" stroke-width="3">
    <circle cx="${size.width * 0.22}" cy="${size.height * 0.28}" r="${Math.min(size.width, size.height) * 0.16}"/>
    <circle cx="${size.width * 0.78}" cy="${size.height * 0.72}" r="${Math.min(size.width, size.height) * 0.2}"/>
  </g>
  <foreignObject x="${size.width * 0.12}" y="${size.height * 0.34}" width="${size.width * 0.76}" height="${size.height * 0.34}">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial,sans-serif;color:white;text-align:center;">
      <div style="font-size:${Math.max(28, size.width / 18)}px;font-weight:800;line-height:1.1;">Aura AI Image</div>
      <div style="margin-top:18px;font-size:${Math.max(18, size.width / 34)}px;line-height:1.35;opacity:.92;">${title || "Generated visual placeholder"}</div>
      <div style="margin-top:24px;font-size:${Math.max(14, size.width / 48)}px;opacity:.72;">Provider fallback preview</div>
    </div>
  </foreignObject>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function createPollinationsUrl(styledPrompt, size, index = 0) {
  const encodedPrompt = encodeURIComponent(styledPrompt);
  const seed = encodeURIComponent(`${styledPrompt}-${Date.now()}-${index}`);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${size.width}&height=${size.height}&seed=${seed}&nologo=true&private=true&enhance=true&safe=true`;
}

async function generateOneImage(styledPrompt, size) {
  let lastError;

  for (let attempt = 1; attempt <= IMAGE_RETRIES + 1; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS);

    try {
      return await hf.textToImage(
        {
          endpointUrl: IMAGE_ENDPOINT,
          inputs: styledPrompt,
          parameters: {
            width: size.width,
            height: size.height,
            guidance_scale: 7.5,
            num_inference_steps: 25,
          },
        },
        {
          signal: controller.signal,
          retry_on_error: true,
        },
      );
    } catch (error) {
      lastError = error;

      if (attempt > IMAGE_RETRIES || !isRetryable(error)) {
        break;
      }

      await sleep(attempt * 1000);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError;
}

async function generatePollinationsImage(styledPrompt, size) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), POLLINATIONS_TIMEOUT_MS);
  const encodedPrompt = encodeURIComponent(styledPrompt);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${size.width}&height=${size.height}&nologo=true&private=true&enhance=true&safe=true`;

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Pollinations returned ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "image/png";
    const buffer = Buffer.from(await response.arrayBuffer());
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } finally {
    clearTimeout(timeout);
  }
}

exports.generateImage = async (prompt, style, count, aspect) => {
  try {
    const styledPrompt = [
      prompt,
      style ? `${style} style` : "",
      "high quality, detailed, sharp focus, professional composition",
    ]
      .filter(Boolean)
      .join(", ");

    const size = aspectMap[aspect] || aspectMap["1:1"];
    const safeCount = Math.min(Math.max(Number(count) || 1, 1), 4);

    const buildImage = async (_, index) => {
      if (!process.env.HF_API_KEY) {
        return createPollinationsUrl(styledPrompt, size, index);
      }

      try {
        const image = await generateOneImage(styledPrompt, size);
        const buffer = Buffer.from(await image.arrayBuffer());
        return `data:image/png;base64,${buffer.toString("base64")}`;
      } catch (hfError) {
        console.warn("Hugging Face image generation failed, using fallback:", hfError.message);
        try {
          return await generatePollinationsImage(styledPrompt, size);
        } catch (fallbackError) {
          console.warn("Image fallback fetch failed, returning direct image URL:", fallbackError.message);
          return createPollinationsUrl(styledPrompt, size, index);
        }
      }
    };

    return Promise.all(Array.from({ length: safeCount }, buildImage));
  } catch (error) {
    console.error("Image generation error:", error);

    return [createFallbackImage(prompt, aspect)];
  }
};

exports.uploadImage = async (images) => {
  const uploadedImages = [];

  for (const image of images) {
    if (/^https?:\/\//i.test(String(image))) {
      uploadedImages.push(image);
      continue;
    }

    if (String(image).startsWith("data:image/svg+xml")) {
      uploadedImages.push(image);
      continue;
    }

    try {
      const result = await withTimeout(
        cloudinary.uploader.upload(image, {
          folder: "aura-ai/images",
          resource_type: "image",
        }),
        CLOUDINARY_UPLOAD_TIMEOUT_MS,
        "Cloudinary upload",
      );
      uploadedImages.push(result.secure_url);
    } catch (error) {
      console.warn("Cloudinary upload failed, returning inline image:", error.message);
      uploadedImages.push(image);
    }
  }

  return uploadedImages;
};
