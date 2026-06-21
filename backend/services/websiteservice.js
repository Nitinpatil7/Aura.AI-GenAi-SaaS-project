const { ChatGroq } = require("@langchain/groq");
const { PromptTemplate } = require("@langchain/core/prompts");
const { getMessageText, withTimeout } = require("../utils/aihelpers");

const WEBSITE_TIMEOUT_MS = Number(process.env.WEBSITE_AI_TIMEOUT_MS || 14000);

function getWebsiteModel() {
  if (!process.env.GROQ_API_KEY) {
    return null;
  }

  return new ChatGroq({
    model: process.env.WEBSITE_AI_MODEL || "llama-3.3-70b-versatile",
    temperature: 0.35,
    apiKey: process.env.GROQ_API_KEY,
    maxTokens: 3200,
    maxRetries: 1,
  });
}

function cleanHtmlOutput(value) {
  return String(value || "")
    .replace(/```html/gi, "")
    .replace(/```/g, "")
    .trim();
}

function fallbackWebsite({ type, theme, font, prompt }) {
  const safePrompt = String(prompt || "AI product").replace(/[<>]/g, "");
  const safeTheme = theme || "purple";
  const wantsImage = /background image|hero image|photo|image|picture|visual/i.test(safePrompt);
  const wantsAnimation = /animation|animated|motion|smooth|transition/i.test(safePrompt);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safePrompt}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
    .aura-fade-up { animation: fadeUp .7s ease both; }
  </style>
</head>
<body class="bg-slate-950 text-white ${wantsImage ? "bg-cover bg-center bg-fixed" : ""}" ${wantsImage ? 'style="background-image: linear-gradient(rgba(2,6,23,.82), rgba(2,6,23,.9)), url(\'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=80\')"' : ""}>
  <header class="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
    <div class="text-xl font-bold">Aura Launch</div>
    <nav class="hidden md:flex gap-6 text-sm text-slate-300">
      <a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a>
    </nav>
    <a href="#contact" class="rounded-lg bg-${safeTheme}-500 px-4 py-2 text-sm font-semibold">Get Started</a>
  </header>
  <main>
    <section class="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
      <div class="${wantsAnimation ? "aura-fade-up" : ""}">
        <p class="text-${safeTheme}-300 font-semibold">${type || "Landing"} website</p>
        <h1 class="mt-4 text-5xl font-black leading-tight">${safePrompt}</h1>
        <p class="mt-6 text-lg text-slate-300">A polished responsive landing page generated from your idea. Live provider fallback is active, so this template keeps the workflow usable.</p>
        <div class="mt-8 flex gap-4"><a class="rounded-xl bg-${safeTheme}-500 px-6 py-3 font-bold" href="#pricing">View Plans</a><a class="rounded-xl border border-white/20 px-6 py-3" href="#features">Explore</a></div>
      </div>
      <div class="rounded-3xl bg-white/10 p-8 shadow-2xl"><div class="aspect-video rounded-2xl bg-gradient-to-br from-${safeTheme}-500 to-cyan-400"></div></div>
    </section>
    <section id="features" class="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">
      ${["Fast setup", "Responsive design", "Conversion focused"].map((item) => `<article class="rounded-2xl bg-white/10 p-6"><h3 class="text-xl font-bold">${item}</h3><p class="mt-3 text-slate-300">Clean sections, strong hierarchy, and practical copy for your audience.</p></article>`).join("")}
    </section>
    <section id="pricing" class="max-w-7xl mx-auto px-6 py-16"><div class="rounded-3xl bg-white text-slate-950 p-10"><h2 class="text-3xl font-black">Simple packages</h2><p class="mt-3 text-slate-600">Start small and upgrade as you grow.</p></div></section>
    <section id="faq" class="max-w-4xl mx-auto px-6 py-16"><h2 class="text-3xl font-black">FAQ</h2><p class="mt-4 text-slate-300">Customize this page with your product details, testimonials, and contact information.</p></section>
  </main>
  <footer id="contact" class="border-t border-white/10 px-6 py-10 text-center text-slate-400">Built with Aura AI</footer>
</body>
</html>`;
}

exports.generatewebsite = async ({ type, theme, font, prompt }) => {
  const template = `
You are a senior frontend engineer and product UI designer.
Generate a complete, polished, production-ready website as pure HTML with TailwindCSS.

WEBSITE DETAILS
- Type: {type}
- Theme: {theme}
- Typography style: {font}
- User request: {prompt}

PRIMARY GOAL
- Interpret the user request literally and make the website match the exact idea.
- Extract every requested business type, audience, feature, section, image/background, color direction, animation, CTA, product detail, and tone from the request.
- If the user asks for specific features, include those features as visible sections/cards/workflow items, not vague placeholders.
- If the user asks for a background image, include a relevant full-bleed or section background image using an Unsplash Source URL or a stable remote image URL with a descriptive alt text.
- If the user asks for animations, include smooth working CSS animations/transitions with prefers-reduced-motion support.
- If the request mentions products, services, pricing, testimonials, portfolios, booking, contact, menu, gallery, dashboard, app download, FAQ, or process, include the corresponding section.

PROMPT ADHERENCE RULES
- First infer the exact domain from the prompt, such as restaurant, gym, AI SaaS, school, portfolio, real estate, event, ecommerce, travel, hospital, coaching, agency, or mobile app.
- All headings, navigation labels, card titles, images, CTA text, testimonials, feature descriptions, pricing/package names, and FAQ questions must fit that domain.
- If the user asks for "background image", the hero or requested section MUST visibly use a CSS background-image with a relevant remote image URL.
- If the user asks for "features", every named feature must appear on the page with its own visible text block.
- If the user asks for "animations", include CSS keyframes or transition classes and apply them to visible elements. Add a prefers-reduced-motion media rule.
- If the user gives colors, respect those colors. If not, choose a balanced palette appropriate to the domain, not only the selected theme color.
- If the user asks for a one-page website, use anchor sections. If the user asks for a multi-section landing page, include all requested sections in order of importance.
- Do not invent unrelated services, fake celebrity names, random company names, or generic startup text when the prompt gives a specific idea.

OUTPUT CONTRACT
- Return ONLY valid HTML. No markdown, no explanation, no code fences.
- Use class, not className.
- Do not use React, JSX, imports, or build tools.
- Include <script src="https://cdn.tailwindcss.com"></script>.
- Include any required custom CSS inside a <style> tag in the HTML.
- Use semantic HTML: header, main, section, footer, nav.
- Make it responsive with sm:, md:, lg:, xl: classes.
- Keep all links/buttons present and visually coherent. Use href anchors for page sections.

QUALITY BAR
- Modern production quality with strong visual hierarchy, polished spacing, responsive layout, and real-feeling copy.
- Strong headline, specific value proposition, and clear primary CTA tailored to the user's prompt.
- Balanced spacing, readable typography, clean cards, subtle shadows, hover transitions.
- Avoid placeholder-only copy. Use content relevant to the user's idea.
- Use accessible labels, meaningful alt text, and good color contrast.
- Keep colors professional and do not overuse one flat color.
- Use realistic images only when helpful or requested. Do not use broken image paths.
- Avoid random content that is unrelated to the user's requested topic.
- Use compact, professional HTML. Avoid over-nesting and avoid empty decorative sections.
- Make buttons, forms, menus, cards, galleries, and pricing sections look finished and usable.

STRUCTURE GUIDANCE
- Always include navbar, hero, main content sections, CTA, and footer.
- Add or remove optional sections according to the prompt so the page feels purpose-built.
- Prefer concrete, prompt-specific section titles and feature copy.
- Make mobile layout excellent: stack grids, avoid overflow, and keep text readable.

FINAL SELF-CHECK BEFORE OUTPUT
- Does the first viewport clearly show the user's requested website idea?
- Are requested background images, features, animations, colors, and sections actually present in code?
- Is every image URL valid-looking and useful for the prompt?
- Is the output complete HTML only, with no markdown?
`;

  const promptTemplate = new PromptTemplate({
    template,
    inputVariables: ["type", "theme", "font", "prompt"],
  });

  const finalPrompt = await promptTemplate.format({
    type: type || "landing",
    theme: theme || "modern",
    font: font || "clean sans-serif",
    prompt,
  });

  try {
    const model = getWebsiteModel();
    if (!model) {
      throw new Error("No website provider API key configured");
    }
    const result = await withTimeout(
      model.invoke(finalPrompt),
      WEBSITE_TIMEOUT_MS,
      "Website generation",
    );
    return cleanHtmlOutput(getMessageText(result));
  } catch (error) {
    console.error("Website generation model error:", error);
    return fallbackWebsite({ type, theme, font, prompt });
  }
};
