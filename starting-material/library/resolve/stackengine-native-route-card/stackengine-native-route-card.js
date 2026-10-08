const DEFAULT_STATE = {
  headline: "HTML GRAPHICS, NATIVE IN RESOLVE",
  accentColor: "#00e87b",
};

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(value, maximum));
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function easeInCubic(value) {
  return value * value * value;
}

class StackEngineNativeRouteCard extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._initialData = {};
    this._schedule = [];
    this._currentStep = 1;

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = `
      :host {
        position: absolute;
        inset: 0;
        display: block;
        pointer-events: none;
        --accent: #00e87b;
        font-family: Inter, "Segoe UI", Arial, sans-serif;
      }
      * { box-sizing: border-box; }
      .scene {
        position: absolute;
        inset: 0;
        opacity: 0;
      }
      .card {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 1680px;
        min-height: 510px;
        padding: 76px 92px 72px;
        overflow: hidden;
        border: 3px solid rgba(245, 245, 245, 0.18);
        border-radius: 42px;
        background: linear-gradient(135deg, rgba(10, 10, 15, 0.97), rgba(26, 10, 62, 0.96));
        box-shadow: 0 36px 110px rgba(0, 0, 0, 0.42);
        transform-origin: center;
      }
      .accent {
        position: absolute;
        inset: 0 auto 0 0;
        width: 18px;
        background: var(--accent);
      }
      .eyebrow {
        margin: 0 0 30px;
        color: var(--accent);
        font-family: "JetBrains Mono", Consolas, monospace;
        font-size: 38px;
        font-weight: 500;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }
      .headline {
        margin: 0;
        max-width: 1450px;
        color: #f5f5f5;
        font-family: "JetBrains Mono", Consolas, monospace;
        font-size: 82px;
        font-weight: 500;
        letter-spacing: -0.035em;
        line-height: 1.08;
      }
      .rule {
        width: 100%;
        height: 3px;
        margin: 48px 0 30px;
        background: linear-gradient(90deg, var(--accent), rgba(139, 92, 246, 0.72), transparent 82%);
        transform-origin: left center;
      }
      .footer {
        display: flex;
        align-items: center;
        gap: 24px;
        color: #a0a0a0;
        font-size: 31px;
        font-weight: 500;
        letter-spacing: 0.02em;
      }
      .badge {
        padding: 12px 20px 11px;
        border: 2px solid var(--accent);
        border-radius: 999px;
        color: #f5f5f5;
        font-family: "JetBrains Mono", Consolas, monospace;
        font-size: 25px;
        letter-spacing: 0.08em;
      }
    `;

    const scene = document.createElement("div");
    scene.className = "scene";
    const card = document.createElement("section");
    card.className = "card";
    const accent = document.createElement("div");
    accent.className = "accent";
    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "Resolve-native OGraf";
    const headline = document.createElement("h1");
    headline.className = "headline";
    const rule = document.createElement("div");
    rule.className = "rule";
    const footer = document.createElement("div");
    footer.className = "footer";
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = "EDITABLE";
    const detail = document.createElement("span");
    detail.textContent = "HTML + CSS + JavaScript • frame-accurate playback";
    footer.append(badge, detail);
    card.append(accent, eyebrow, headline, rule, footer);
    scene.append(card);
    root.append(style, scene);

    this._elements = { scene, card, eyebrow, headline, rule, footer };
  }

  async load(params) {
    this._initialData = params?.data || {};
    this._state = { ...DEFAULT_STATE, ...this._initialData };
    this._schedule = [];
    this._currentStep = 1;
    this._applyState();
    if (document.fonts?.load) {
      await Promise.all([
        document.fonts.load('500 82px "JetBrains Mono"'),
        document.fonts.load('500 31px Inter'),
      ]).catch(() => undefined);
    }
    this._setFrame(0);
    return { statusCode: 200 };
  }

  async dispose() {
    this._elements.scene.remove();
    return { statusCode: 200 };
  }

  async playAction(params) {
    this._currentStep = typeof params?.goto === "number" ? params.goto : 1;
    this._setFrame(params?.skipAnimation ? 1 : 0);
    return { statusCode: 200, currentStep: this._currentStep };
  }

  async stopAction(params) {
    this._currentStep = 0;
    this._setFrame(params?.skipAnimation ? 9 : 8.2);
    return { statusCode: 200 };
  }

  async updateAction(params) {
    this._state = { ...this._state, ...(params?.data || {}) };
    this._initialData = { ...this._initialData, ...(params?.data || {}) };
    this._applyState();
    return { statusCode: 200 };
  }

  async customAction() {
    return { statusCode: 200 };
  }

  async setActionsSchedule(payload) {
    this._schedule = (payload?.schedule || payload?.actions || []).slice().sort((a, b) => a.timestamp - b.timestamp);
    return { statusCode: 200 };
  }

  async goToTime(payload) {
    const timestamp = payload?.timestamp ?? 0;
    this._state = { ...DEFAULT_STATE, ...this._initialData };
    this._currentStep = 1;
    for (const event of this._schedule) {
      if (event.timestamp > timestamp) break;
      const type = event.action?.type;
      const params = event.action?.params || {};
      if (type === "updateAction") {
        this._state = { ...this._state, ...(params.data || {}) };
      } else if (type === "playAction") {
        this._currentStep = 1;
      } else if (type === "stopAction") {
        this._currentStep = 0;
      }
    }
    this._applyState();
    this._setFrame(timestamp / 1000);
    return { statusCode: 200 };
  }

  _applyState() {
    this._elements.headline.textContent = this._state.headline;
    this.style.setProperty("--accent", this._state.accentColor || DEFAULT_STATE.accentColor);
  }

  _setFrame(seconds) {
    const { scene, card, eyebrow, headline, rule, footer } = this._elements;
    if (this._currentStep === 0 || seconds < 0 || seconds > 8.6) {
      scene.style.opacity = "0";
      return;
    }

    const intro = easeOutCubic(clamp(seconds / 0.55, 0, 1));
    const textIn = easeOutCubic(clamp((seconds - 0.18) / 0.55, 0, 1));
    const ruleIn = easeOutCubic(clamp((seconds - 0.42) / 0.55, 0, 1));
    const outro = easeInCubic(clamp((seconds - 8.0) / 0.6, 0, 1));
    const visibility = 1 - outro;

    scene.style.opacity = String(visibility);
    card.style.transform = `translate(-50%, calc(-50% + ${(1 - intro) * 70}px)) scale(${0.965 + intro * 0.035})`;
    eyebrow.style.opacity = String(textIn);
    eyebrow.style.transform = `translateY(${(1 - textIn) * 24}px)`;
    headline.style.opacity = String(textIn);
    headline.style.transform = `translateY(${(1 - textIn) * 30}px)`;
    rule.style.transform = `scaleX(${ruleIn})`;
    footer.style.opacity = String(ruleIn);
  }
}

export default StackEngineNativeRouteCard;
