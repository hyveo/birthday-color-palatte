const COLOR_DATA_URL = "./data/birthday-colors.json";
const SHORTENER_URL = "https://tinyurl.com/api-create.php";
const chatLog = document.querySelector("#chatLog");
const chatForm = document.querySelector("#chatForm");
const birthdayInput = document.querySelector("#birthdayMessage");
const roomStatus = document.querySelector("#roomStatus");

const nicknames = [
  "푸른 방문자",
  "햇살 방문자",
  "라임 방문자",
  "복숭아 방문자",
  "은빛 방문자",
  "민트 방문자"
];

const COLOR_NAME_BY_FAMILY = {
  "Soft Neutral": "소프트 뉴트럴",
  "Deep Neutral": "딥 뉴트럴",
  "Warm Orange": "웜 오렌지",
  "Rose Red": "로즈 레드",
  "Fresh Green": "프레시 그린",
  "Olive Green": "올리브 그린",
  "Violet Blue": "바이올렛 블루",
  "Clear Blue": "클리어 블루",
  "Deep Teal": "틸 그린"
};

const PERSONALITY_KO_OVERRIDES = {
  "0702": "감성이 풍부하고 세련된 도시형"
};

const COMMON_NAME_KO_OVERRIDES = {
  Amour: "아무르",
  Aquarius: "아쿠아리우스",
  Argent: "아르젠트",
  "Avocado Stone": "아보카도 스톤",
  Beige: "베이지",
  Bruschetta: "브루스케타",
  "Crash Dummy": "크래시 더미",
  "Cry of a Rose": "크라이 오브 어 로즈",
  "Dainty Peach": "데인티 피치",
  "Distant Cloud": "디스턴트 클라우드",
  "Emerald City": "에메랄드 시티",
  "Ephren Blue": "에프렌 블루",
  "Espresso Macchiato": "에스프레소 마키아토",
  "Espresso Martini": "에스프레소 마티니",
  "Final Departure": "파이널 디파처",
  "Freshly Roasted Coffee": "프레시 로스티드 커피",
  "Golf Course": "골프 코스",
  Haystack: "헤이스택",
  "Heather Berry": "헤더 베리",
  "Hot Fudge": "핫 퍼지",
  Ibis: "아이비스",
  "Kiss of the Scorpion": "키스 오브 더 스콜피온",
  "La Luna": "달 노란색",
  Leapfrog: "리프프로그",
  "Love Letter": "러브 레터",
  "Lugganath Orange": "러거나스 오렌지",
  Mantis: "맨티스",
  Melondrama: "멜론드라마",
  "Merlot Fields": "메를로 필즈",
  "Nevermind Nirvana": "네버마인드 너바나",
  Nickel: "니켈",
  "Night Market": "나이트 마켓",
  "Party Sponge Cake": "파티 스펀지 케이크",
  "Peach Scone": "피치 스콘",
  "Pick Your Brain": "픽 유어 브레인",
  "Pitch-Black Forests": "피치 블랙 포레스트",
  Rohwurst: "로부르스트",
  Roasted: "로스티드",
  "Royal Blush": "로열 블러시",
  "Secret Garden": "시크릿 가든",
  "Self-Love": "셀프 러브",
  "Smoked Oyster": "스모크드 오이스터",
  "Sprig of Sage": "스프리그 오브 세이지",
  Starstruck: "스타스트럭",
  Subnautical: "서브노티컬",
  "Sunny Glory": "서니 글로리",
  "Try Your Luck": "트라이 유어 럭",
  Underground: "언더그라운드",
  "Vanilla Blush": "바닐라 블러시",
  "Velvet Cosmos": "벨벳 코스모스",
  "Velvet Vortex": "벨벳 볼텍스",
  "Walking on Sunshine": "워킹 온 선샤인",
  Walnut: "월넛",
  "Waxy Corn": "왁시 콘",
  "Willow Leaf": "윌로 리프",
  "Wing Commander": "윙 커맨더",
  "Woodland Wonder": "우드랜드 원더",
  "Yuzukoshō": "유즈코쇼"
};

const COMMON_COLOR_WORDS_KO = {
  Blue: "블루",
  Red: "레드",
  Green: "그린",
  Orange: "오렌지",
  Yellow: "옐로",
  Purple: "퍼플",
  Pink: "핑크",
  Brown: "브라운",
  Grey: "그레이",
  Gray: "그레이",
  Black: "블랙",
  White: "화이트",
  Gold: "골드",
  Silver: "실버"
};

let colorMap = {};
let isReady = false;
let hasSharedCardOnLoad = false;

function initGoogleAnalytics() {
  const measurementId =
    window.BIRTHDAY_COLOR_GA_ID ||
    document.querySelector("meta[name='google-analytics-id']")?.content.trim() ||
    "";

  if (!/^G-[A-Z0-9]+$/i.test(measurementId)) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.append(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId);
}

function trackEvent(eventName, params = {}) {
  if (typeof window.gtag !== "function") return;

  window.gtag("event", eventName, {
    event_category: "birthday_color",
    ...params
  });
}

function getTrackingDateParams(key) {
  return {
    birthday_key: key
  };
}

function initGoogleAdSense() {
  const clientId =
    window.BIRTHDAY_COLOR_ADSENSE_CLIENT ||
    document.querySelector("meta[name='google-adsense-client']")?.content.trim() ||
    "";

  if (!/^ca-pub-\d+$/i.test(clientId)) return;

  const script = document.createElement("script");
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
  document.head.append(script);
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function getKey(month, day) {
  return `${pad(month)}${pad(day)}`;
}

function getReadableDate(key) {
  return `${Number(key.slice(0, 2))}월 ${Number(key.slice(2))}일`;
}

function getCanonicalCardUrl(key) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("b", key);
  return url.toString();
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const bigint = parseInt(value, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

function getContrast(hex) {
  const { r, g, b } = hexToRgb(hex);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? "#111111" : "#FFFFFF";
}

function isLightColor(hex) {
  return getContrast(hex) === "#111111";
}

function getMood(hex) {
  const { r, g, b } = hexToRgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  if (r < 70 && g > 70 && b > 70 && Math.abs(g - b) < 42) return "Deep Teal";
  if (max - min < 24) return max > 190 ? "Soft Neutral" : "Deep Neutral";
  if (r === max && g > b) return "Warm Orange";
  if (r === max) return "Rose Red";
  if (g === max && b > r) return "Fresh Green";
  if (g === max) return "Olive Green";
  if (b === max && r > g) return "Violet Blue";
  return "Clear Blue";
}

function getKoreanPredicateEnding(text) {
  const last = text.trim().at(-1);
  if (!last) return "이에요";

  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return "이에요";
  return (code - 0xac00) % 28 === 0 ? "예요" : "이에요";
}

function getColorRecord(key) {
  const record = colorMap[key];
  if (!record) return null;
  if (typeof record === "string") return { hex: record };
  return record;
}

function hasJapaneseKana(value) {
  return /[\u3040-\u30ff]/.test(value || "");
}

function hasJapaneseText(value) {
  return /[\u3040-\u30ff\u3400-\u9fff]/.test(value || "");
}

function cleanDisplayText(value) {
  return String(value || "")
    .replace(/\|+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getLocalizedText(value, fallback = "", options = {}) {
  const { allowJapanese = true } = options;
  if (!value) return fallback;
  if (typeof value === "string") {
    const text = cleanDisplayText(value);
    return !allowJapanese && hasJapaneseText(text) ? fallback : text;
  }
  const candidates = [value.ko, value.en];
  if (allowJapanese) candidates.push(value.ja);

  for (const candidate of candidates) {
    const text = cleanDisplayText(candidate);
    if (text && (allowJapanese || !hasJapaneseText(text))) return text;
  }

  return fallback;
}

function getLocalizedList(value, options = {}) {
  const { allowJapanese = true } = options;
  if (!value) return [];
  const list = Array.isArray(value) ? value : value.ko?.length ? value.ko : allowJapanese ? value.ja : [];
  return list
    .map((item) => cleanDisplayText(item))
    .filter((item) => item && (allowJapanese || !hasJapaneseText(item)));
}

function getEnglishText(value) {
  const text = cleanDisplayText(value);
  return text && /[A-Za-z]/.test(text) && !hasJapaneseKana(text) ? text : "";
}

function getKoreanCommonName(name) {
  if (!name) return "";
  if (COMMON_NAME_KO_OVERRIDES[name]) return COMMON_NAME_KO_OVERRIDES[name];
  return name
    .split(" ")
    .map((word) => COMMON_COLOR_WORDS_KO[word] || word)
    .join(" ");
}

function getSourceNameParts(record, fallbackName) {
  const ko = getLocalizedText(record.name, fallbackName, { allowJapanese: false });
  const en = getEnglishText(record.name?.en);
  const ja = cleanDisplayText(record.name?.ja);
  return { ko, en, ja };
}

function isExactCommonName(record, hex) {
  const matchedHex = record.commonSource?.matchedHex?.toUpperCase();
  return Boolean(
    record.name?.common &&
      matchedHex === hex.toUpperCase() &&
      Number(record.commonSource?.distance || 0) === 0
  );
}

function isDisplayableCommonName(record) {
  return Boolean(record.name?.common && record.commonSource?.isGoodName);
}

function getColorProfile(key) {
  const record = getColorRecord(key);
  const hex = record.hex;
  const rgb = hexToRgb(hex);
  const family = record.family || getMood(hex);
  const familyLabel = COLOR_NAME_BY_FAMILY[family] || family;
  const fallbackName = COLOR_NAME_BY_FAMILY[family] || family;
  const { ko: nameKo, en: nameEn, ja: nameJa } = getSourceNameParts(record, fallbackName);
  const name = nameKo;
  const commonName = isDisplayableCommonName(record) ? record.name.common : "";
  const commonNameKo = getKoreanCommonName(commonName);
  const matchedCommonHex = record.commonSource?.matchedHex?.toUpperCase() || "";
  const shouldShowCommonHex = matchedCommonHex && matchedCommonHex !== hex.toUpperCase();
  const sourceDetail = nameEn;
  const displayName = sourceDetail ? `${nameKo}(${sourceDetail})` : nameKo;
  const badgeName = [nameEn || commonName || family, nameJa].filter(Boolean).join(" ∙ ");
  const similarName =
    commonName && commonNameKo && commonNameKo !== commonName
      ? `${commonNameKo} (${commonName})`
      : commonName;
  const similarHex = shouldShowCommonHex ? matchedCommonHex : "";
  const similarRgb = similarHex ? hexToRgb(similarHex) : null;
  const words = getLocalizedList(record.words, { allowJapanese: false });
  const personality =
    PERSONALITY_KO_OVERRIDES[key] ||
    getLocalizedText(record.personality, "", { allowJapanese: false });
  const summary = personality || `${familyLabel} 계열의 ${name}${getKoreanPredicateEnding(name)}.`;

  return {
    hex,
    rgb,
    family,
    familyLabel,
    name,
    nameEn,
    nameJa,
    badgeName,
    displayName,
    similarName,
    similarHex,
    similarRgb,
    commonName,
    words,
    personality,
    summary
  };
}

function scrollToLatest() {
  chatLog.scrollTop = chatLog.scrollHeight;
}

function appendTextMessage(role, text) {
  const message = document.createElement("article");
  const bubble = document.createElement("p");
  message.className = `message ${role}`;
  bubble.className = "bubble";
  bubble.textContent = text;
  message.append(bubble);
  chatLog.append(message);
  scrollToLatest();
}

function appendTypingMessage() {
  const message = document.createElement("article");
  const bubble = document.createElement("div");
  message.className = "message bot";
  bubble.className = "bubble typing";
  bubble.setAttribute("aria-label", "답변 작성중");
  bubble.innerHTML = "<span></span><span></span><span></span>";
  message.append(bubble);
  chatLog.append(message);
  scrollToLatest();
  return message;
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function appendThinkingSteps(steps) {
  const message = document.createElement("article");
  const panel = document.createElement("section");
  const title = document.createElement("div");
  const list = document.createElement("ol");

  message.className = "message bot thinking-message";
  panel.className = "thought-panel";
  panel.setAttribute("aria-label", "Thinking");
  title.className = "thought-title";
  title.innerHTML = "<span></span><strong>Thinking</strong>";
  list.className = "thought-list";
  panel.append(title, list);
  message.append(panel);
  chatLog.append(message);
  scrollToLatest();

  for (const step of steps) {
    const item = document.createElement("li");
    const label = document.createElement("span");
    const source = document.createElement("small");
    const text = typeof step === "string" ? step : step.text;
    const sourceText = typeof step === "string" ? "" : step.source || "";

    item.className = "is-active";
    label.textContent = text;
    item.append(label);
    if (sourceText) {
      source.className = "thought-source";
      source.textContent = sourceText;
      item.append(source);
    }
    list.append(item);
    scrollToLatest();
    await wait(560);
    item.classList.remove("is-active");
    item.classList.add("is-done");
    await wait(140);
  }
}

function setButtonStatus(button, text, resetText = text) {
  button.textContent = text;
  if (resetText !== text) {
    window.setTimeout(() => {
      button.textContent = resetText;
    }, 1400);
  }
}

function showToast(message) {
  const shell = document.querySelector(".phone-shell") || document.body;
  let toast = shell.querySelector(".toast-message");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast-message";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    shell.append(toast);
  }

  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 1500);
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall back for browsers that expose clipboard but deny write permission.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function appendColorDetail(parent, label, value, options = {}) {
  const { copyable = false, note = "", copyValue = value } = options;
  const row = document.createElement("div");
  const term = document.createElement("dt");
  const definition = document.createElement("dd");
  const valueText = document.createElement("span");

  if (note) row.classList.add("has-note");
  term.textContent = label;
  valueText.textContent = value;

  definition.append(valueText);
  if (note) {
    const noteText = document.createElement("small");
    noteText.textContent = note;
    definition.append(noteText);
  }

  if (copyable) {
    const copyButton = document.createElement("button");
    copyButton.className = "copy-value-button";
    copyButton.type = "button";
    copyButton.dataset.label = `${label} 복사`;
    copyButton.setAttribute("aria-label", `${label} 복사`);
    copyButton.addEventListener("click", async () => {
      try {
        await copyText(copyValue);
        showToast(`${label} 값이 복사되었습니다.`);
      } catch {
        copyButton.classList.add("is-failed");
        window.setTimeout(() => {
          copyButton.classList.remove("is-failed");
        }, 1200);
      }
    });
    definition.append(copyButton);
  }

  row.append(term, definition);
  parent.append(row);
}

function createCopyButton(label, value) {
  const copyButton = document.createElement("button");
  copyButton.className = "copy-value-button";
  copyButton.type = "button";
  copyButton.dataset.label = `${label} 복사`;
  copyButton.setAttribute("aria-label", `${label} 복사`);
  copyButton.addEventListener("click", async () => {
    try {
      await copyText(value);
      showToast(`${label} 값이 복사되었습니다.`);
    } catch {
      copyButton.classList.add("is-failed");
      window.setTimeout(() => {
        copyButton.classList.remove("is-failed");
      }, 1200);
    }
  });
  return copyButton;
}

function createValueCopyButton(label, value) {
  const button = document.createElement("button");
  button.className = "value-copy-button";
  button.type = "button";
  button.textContent = label;
  button.dataset.label = `${label} 복사`;
  button.setAttribute("aria-label", `${label} 복사`);
  button.addEventListener("click", async () => {
    try {
      await copyText(value);
      showToast(`${label} 값이 복사되었습니다.`);
    } catch {
      button.classList.add("is-failed");
      window.setTimeout(() => {
        button.classList.remove("is-failed");
      }, 1200);
    }
  });
  return button;
}

function createRgbCopyButton(value) {
  return createValueCopyButton("RGB", value);
}

function appendHexDetail(parent, mainHex, mainRgb, similarHex = "", similarRgb = null) {
  const row = document.createElement("div");
  const term = document.createElement("dt");
  const definition = document.createElement("dd");
  const values = document.createElement("span");

  row.className = "hex-row";
  term.textContent = "색상값";
  values.className = "hex-values";

  [
    { hex: mainHex, rgb: mainRgb },
    similarHex && similarRgb ? { hex: similarHex, rgb: similarRgb } : null
  ]
    .filter(Boolean)
    .forEach(({ hex, rgb }) => {
      const item = document.createElement("span");
      const swatch = document.createElement("i");
      const text = document.createElement("b");
      const rgbValue = formatRgbValue(rgb);

      item.className = "hex-value";
      swatch.style.backgroundColor = hex;
      text.textContent = hex;
      item.append(swatch, text, createValueCopyButton("HEX", hex), createRgbCopyButton(rgbValue));
      values.append(item);
    });

  definition.append(values);
  row.append(term, definition);
  parent.append(row);
}

function formatRgbValue(rgb) {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

function formatKeywords(words) {
  return words.map((word) => `#${word}`).join(" · ");
}

async function getShareUrl(key) {
  const longUrl = getCanonicalCardUrl(key);
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return longUrl;
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(`${SHORTENER_URL}?url=${encodeURIComponent(longUrl)}`, {
      signal: controller.signal
    });
    const shortUrl = (await response.text()).trim();
    if (response.ok && /^https?:\/\/\S+$/i.test(shortUrl)) return shortUrl;
  } catch {
    // External shorteners can fail because of CORS, rate limits, or local preview URLs.
  } finally {
    window.clearTimeout(timer);
  }

  return longUrl;
}

function buildCardFilename(key) {
  return `birthday-color-${key}.png`;
}

function getInlineCssText() {
  return Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules || [])
          .map((rule) => rule.cssText)
          .join("\n");
      } catch {
        return "";
      }
    })
    .filter(Boolean)
    .join("\n");
}

function waitForHtml2Canvas() {
  if (window.html2canvas) return Promise.resolve(window.html2canvas);

  return new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-html2canvas-loader]");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.html2canvas), { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
    script.async = true;
    script.dataset.html2canvasLoader = "true";
    script.addEventListener("load", () => resolve(window.html2canvas), { once: true });
    script.addEventListener("error", reject, { once: true });
    document.head.append(script);
  });
}

async function saveRenderedCard(key, cardElement) {
  const html2canvas = await waitForHtml2Canvas();
  if (document.fonts?.ready) await document.fonts.ready;

  cardElement.classList.add("is-capture-export");
  try {
    const canvas = await html2canvas(cardElement, {
      backgroundColor: null,
      scale: Math.min(3, window.devicePixelRatio || 2),
      useCORS: true
    });
    const link = document.createElement("a");
    link.download = buildCardFilename(key);
    link.href = canvas.toDataURL("image/png");
    link.click();
  } finally {
    cardElement.classList.remove("is-capture-export");
  }
}

async function saveRenderedCardWithSvg(key, cardElement) {
  const rect = cardElement.getBoundingClientRect();
  const scale = 3;
  const padding = 18;
  const width = Math.ceil(rect.width);
  const height = Math.ceil(rect.height);
  const clone = cardElement.cloneNode(true);
  const style = document.createElement("style");
  const wrapper = document.createElement("div");

  style.textContent = `
    ${getInlineCssText()}
    * { box-sizing: border-box; }
    body { margin: 0; }
    .capture-wrap {
      width: ${width + padding * 2}px;
      min-height: ${height + padding * 2}px;
      padding: ${padding}px;
      background: transparent;
      font-family: Paperlogy, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .capture-wrap .color-card {
      width: ${width}px !important;
      margin: 0 !important;
    }
    .capture-wrap .copy-value-button,
    .capture-wrap .value-copy-button {
      display: none !important;
    }
  `;
  wrapper.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  wrapper.className = "capture-wrap";
  wrapper.append(style, clone);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width + padding * 2}" height="${height + padding * 2}" viewBox="0 0 ${width + padding * 2} ${height + padding * 2}">
      <foreignObject width="100%" height="100%">${new XMLSerializer().serializeToString(wrapper)}</foreignObject>
    </svg>
  `;
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  const image = new Image();

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = (width + padding * 2) * scale;
  canvas.height = (height + padding * 2) * scale;
  const context = canvas.getContext("2d");
  context.scale(scale, scale);
  context.drawImage(image, 0, 0);
  URL.revokeObjectURL(url);

  const link = document.createElement("a");
  link.download = buildCardFilename(key);
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function drawRoundedRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function drawCardText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (context.measureText(testLine).width > maxWidth && line) {
      context.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line) context.fillText(line, x, currentY);
}

async function saveBirthdayCard(key, cardElement = null) {
  if (cardElement) {
    try {
      await saveRenderedCard(key, cardElement);
      return;
    } catch {
      try {
        await saveRenderedCardWithSvg(key, cardElement);
        return;
      } catch {
        // Fall back to the canvas-drawn card if DOM capture is not available.
      }
    }
  }

  const profile = getColorProfile(key);
  const {
    hex,
    badgeName,
    displayName,
    similarName,
    words,
    summary
  } = profile;
  const keywordText = formatKeywords(words);
  const rows = [
    { label: "컬러명", value: displayName, note: similarName },
    { label: "키워드", value: keywordText }
  ];
  const visibleRows = rows.filter(({ value }) => value);
  const firstRowY = 468;
  const rowGap = 44;
  const lastRowBottom = visibleRows.reduce((bottom, row, index) => {
    const y = firstRowY + index * rowGap;
    return Math.max(bottom, y + (row.note ? 30 : 20));
  }, firstRowY);
  const canvas = document.createElement("canvas");
  const scale = 3;
  const width = 368;
  const cardX = 18;
  const cardY = 18;
  const cardWidth = 332;
  const height = Math.max(620, lastRowBottom + 92);
  canvas.width = width * scale;
  canvas.height = height * scale;

  const context = canvas.getContext("2d");
  context.scale(scale, scale);

  context.fillStyle = "#FFFDF9";
  drawRoundedRect(context, cardX, cardY, cardWidth, height - cardY * 2, 26);
  context.fill();
  context.strokeStyle = "rgba(13, 13, 13, 0.12)";
  context.lineWidth = 1;
  context.stroke();

  context.strokeStyle = "#FFFFFF";
  context.lineWidth = 8;
  drawRoundedRect(context, cardX + 4, cardY + 4, cardWidth - 8, height - cardY * 2 - 8, 22);
  context.stroke();

  context.fillStyle = hex;
  drawRoundedRect(context, cardX + 14, cardY + 14, cardWidth - 28, 244, 18);
  context.fill();
  context.font = "900 13px sans-serif";
  const badgeWidth = Math.min(Math.max(context.measureText(badgeName).width + 20, 92), cardWidth - 64);
  context.fillStyle = isLightColor(hex) ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.28)";
  drawRoundedRect(context, cardX + 34, cardY + 202, badgeWidth, 30, 15);
  context.fill();
  if (isLightColor(hex)) {
    context.strokeStyle = "rgba(13, 13, 13, 0.18)";
    context.lineWidth = 1;
    context.stroke();
  }
  context.fillStyle = getContrast(hex);
  context.textBaseline = "middle";
  context.fillText(badgeName, cardX + 44, cardY + 217);
  context.textBaseline = "alphabetic";

  context.fillStyle = "#171717";
  context.textAlign = "center";
  context.font = "900 36px sans-serif";
  context.fillText(getReadableDate(key), width / 2, 336);

  context.fillStyle = "#454B52";
  context.font = "800 14px sans-serif";
  drawCardText(
    context,
    summary,
    width / 2,
    378,
    260,
    20
  );

  context.textAlign = "left";
  context.font = "900 14px sans-serif";
  visibleRows.forEach(({ label, value, note }, index) => {
    const y = firstRowY + index * rowGap;
    context.fillStyle = "#6B6F76";
    context.fillText(label, cardX + 28, y);
    context.fillStyle = "#0D0D0D";
    context.textAlign = "right";
    context.fillText(value, width - cardX - 28, y, 220);
    if (note) {
      context.fillStyle = "#8A9097";
      context.font = "800 11px sans-serif";
      context.fillText(note, width - cardX - 28, y + 16, 220);
      context.font = "900 14px sans-serif";
    }
    context.textAlign = "left";
    context.strokeStyle = "#E7E3DC";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(cardX + 28, y + (note ? 28 : 20));
    context.lineTo(width - cardX - 28, y + (note ? 28 : 20));
    context.stroke();
  });

  context.textAlign = "center";
  context.fillStyle = "#9AA0A6";
  context.font = "800 13px sans-serif";
  context.fillText("© hyveo", width / 2, height - 34);

  const link = document.createElement("a");
  link.download = buildCardFilename(key);
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function appendColorCard(key, options = {}) {
  const { source = "search" } = options;
  const profile = getColorProfile(key);
  const {
    hex,
    rgb,
    badgeName,
    displayName,
    similarName,
    similarHex,
    similarRgb,
    words,
    personality,
    summary: summaryText
  } = profile;
  const message = document.createElement("article");
  const card = document.createElement("section");
  const swatch = document.createElement("div");
  const swatchLabel = document.createElement("span");
  const info = document.createElement("div");
  const title = document.createElement("h2");
  const summary = document.createElement("p");
  const detailList = document.createElement("dl");
  const credit = document.createElement("p");
  const actions = document.createElement("div");
  const saveButton = document.createElement("button");
  const shareButton = document.createElement("button");

  message.className = "message bot";
  card.className = "color-card";
  swatch.className = "color-swatch";
  if (isLightColor(hex)) swatch.classList.add("is-light-swatch");
  swatch.style.setProperty("--swatch", hex);
  swatch.style.setProperty("--swatch-ink", getContrast(hex));
  swatchLabel.textContent = badgeName;
  title.textContent = getReadableDate(key);
  summary.className = "color-summary";
  summary.textContent = summaryText;
  info.className = "color-info";
  appendColorDetail(detailList, "컬러명", displayName, { note: similarName });
  if (words.length) appendColorDetail(detailList, "키워드", formatKeywords(words));
  appendHexDetail(detailList, hex, rgb, similarHex, similarRgb);
  credit.className = "color-card-credit";
  credit.textContent = "© hyveo";
  actions.className = "card-actions";
  saveButton.className = "card-action-button";
  saveButton.type = "button";
  saveButton.textContent = "카드 저장";
  saveButton.addEventListener("click", async () => {
    trackEvent("card_save", {
      ...getTrackingDateParams(key),
      action_status: "start"
    });

    try {
      await saveBirthdayCard(key, card);
      setButtonStatus(saveButton, "저장됨", "카드 저장");
      trackEvent("card_save", {
        ...getTrackingDateParams(key),
        action_status: "success"
      });
    } catch {
      setButtonStatus(saveButton, "실패", "카드 저장");
      trackEvent("card_save", {
        ...getTrackingDateParams(key),
        action_status: "failure"
      });
    }
  });

  shareButton.className = "card-action-button";
  shareButton.type = "button";
  shareButton.textContent = "공유하기";
  shareButton.addEventListener("click", async () => {
    setButtonStatus(shareButton, "생성중");
    trackEvent("share_copy", {
      ...getTrackingDateParams(key),
      action_status: "start"
    });
    try {
      const shareUrl = await getShareUrl(key);
      await copyText(shareUrl);
      setButtonStatus(shareButton, "복사됨", "공유하기");
      trackEvent("share_copy", {
        ...getTrackingDateParams(key),
        action_status: "success"
      });
    } catch {
      setButtonStatus(shareButton, "실패", "공유하기");
      trackEvent("share_copy", {
        ...getTrackingDateParams(key),
        action_status: "failure"
      });
    }
  });

  actions.append(saveButton, shareButton);
  swatch.append(swatchLabel);
  info.append(title, summary, detailList, credit);
  card.append(swatch, info);
  message.append(card, actions);
  chatLog.append(message);
  scrollToLatest();
  trackEvent("birthday_card_view", {
    ...getTrackingDateParams(key),
    view_source: source
  });
}

function getDaysInMonth(month) {
  if (month === 2) return 29;
  if ([4, 6, 9, 11].includes(month)) return 30;
  return 31;
}

function toValidKey(month, day) {
  if (!Number.isInteger(month) || !Number.isInteger(day)) return "";
  if (month < 1 || month > 12) return "";
  if (day < 1 || day > getDaysInMonth(month)) return "";
  const key = getKey(month, day);
  return getColorRecord(key)?.hex ? key : "";
}

function parseBirthday(input) {
  const value = input.trim();
  const compact = value.replace(/\s/g, "");
  const yearFirst = compact.match(/^\d{4}[-./년]?(\d{1,2})[-./월]?(\d{1,2})일?$/);
  const korean = compact.match(/^(\d{1,2})월(\d{1,2})일?$/);
  const separated = compact.match(/^(\d{1,2})[-./](\d{1,2})$/);
  const fourDigits = compact.match(/^(\d{2})(\d{2})$/);

  if (yearFirst) return toValidKey(Number(yearFirst[1]), Number(yearFirst[2]));
  if (korean) return toValidKey(Number(korean[1]), Number(korean[2]));
  if (separated) return toValidKey(Number(separated[1]), Number(separated[2]));
  if (fourDigits) return toValidKey(Number(fourDigits[1]), Number(fourDigits[2]));
  return "";
}

function setComposerDisabled(disabled) {
  birthdayInput.disabled = disabled;
  chatForm.querySelector("button").disabled = disabled;
}

async function answerBirthday(input) {
  const key = parseBirthday(input);

  if (!key) {
    await appendThinkingSteps(["입력해주신 생일 형식을 확인하고 있어요."]);
    appendTextMessage("bot", "생일을 찾지 못했어요. 7월 2일처럼 다시 입력해주세요.");
    return;
  }

  trackEvent("birthday_search", getTrackingDateParams(key));

  await appendThinkingSteps([
    "입력해주신 생일을 날짜 형식으로 정리하고 있어요.",
    {
      text: "366개 Birthday Color 데이터에서 맞는 컬러칩을 찾고 있어요.",
      source: "출처: birthday-color.cafein.jp"
    },
    {
      text: "컬러칩에 어울리는 색상 명칭을 조회하고 있어요.",
      source: "출처: meodai/color-names"
    },
    "결과 카드를 준비하고 있어요."
  ]);
  appendTextMessage("bot", `${getReadableDate(key)}의 Birthday Color를 분석했어요.`);
  appendColorCard(key, { source: "search" });
}

function getInitialSharedKey() {
  const params = new URLSearchParams(window.location.search);
  const key = params.get("b") || "";
  return /^\d{4}$/.test(key) ? key : "";
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = birthdayInput.value.trim();
  if (!value || !isReady) return;

  appendTextMessage("user", value);
  birthdayInput.value = "";
  answerBirthday(value);
});

async function init() {
  const nickname = nicknames[Math.floor(Math.random() * nicknames.length)];
  roomStatus.textContent = "Birthday color GPT";
  setComposerDisabled(true);
  appendTextMessage("bot", "안녕하세요, 저는 ColorChipGPT예요. 생일을 알려주시면 당신의 Birthday Color를 찾아드릴게요. 예: 7월 2일, 0702");

  try {
    const response = await fetch(COLOR_DATA_URL);
    if (!response.ok) throw new Error("Birthday color data request failed");
    colorMap = await response.json();
    isReady = true;
    setComposerDisabled(false);
    birthdayInput.focus();

    const sharedKey = getInitialSharedKey();
    if (sharedKey && colorMap[sharedKey] && !hasSharedCardOnLoad) {
      hasSharedCardOnLoad = true;
      trackEvent("shared_page_open", getTrackingDateParams(sharedKey));
      appendTextMessage("bot", `공유받은 ${getReadableDate(sharedKey)} Birthday Color예요.`);
      appendColorCard(sharedKey, { source: "shared_page" });
    }
  } catch {
    appendTextMessage("bot", "컬러칩 데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
  }
}

initGoogleAnalytics();
initGoogleAdSense();
init();
