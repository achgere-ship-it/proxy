const DEFAULT_SETTINGS = {
  enabled: false,
  scheme: "HTTP", // HTTP | HTTPS | SOCKS5
  host: "",
  port: 0,
  username: "",
  password: ""
};

function buildPac({ scheme, host, port }) {
  const proto = scheme === "SOCKS5" ? "SOCKS5" : "PROXY";
  return `function FindProxyForURL(url, host) { return "${proto} ${host}:${port}"; }`;
}

async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(DEFAULT_SETTINGS, (res) =>
      resolve({ ...DEFAULT_SETTINGS, ...res })
    );
  });
}

async function applyProxy(settings) {
  if (!settings.enabled) {
    chrome.proxy.settings.clear({ scope: "regular" });
    updateBadge(false);
    return;
  }
  if (!settings.host || !settings.port) {
    updateBadge(false, "!");
    return;
  }
  const pac = buildPac(settings);
  chrome.proxy.settings.set(
    { value: { mode: "pac_script", pacScript: { data: pac } }, scope: "regular" },
    () => updateBadge(true)
  );
}

function updateBadge(on, text) {
  chrome.action.setBadgeText({ text: text ?? (on ? "ON" : "") });
  chrome.action.setBadgeBackgroundColor({ color: on ? "#198754" : "#777777" });
}

// === Автоподстановка логина/пароля для HTTP-прокси ===
// Требует permissions: webRequest, webRequestAuthProvider, webRequestBlocking
chrome.webRequest.onAuthRequired.addListener(
  (details, callback) => {
    chrome.storage.local.get(
      { enabled: false, username: "", password: "" },
      (s) => {
        if (!s.enabled || !s.username || !s.password) return callback({});
        callback({ authCredentials: { username: s.username, password: s.password } });
      }
    );
  },
  { urls: ["<all_urls>"] },
  ["asyncBlocking"] // важно для выдачи кредов синхронно для запроса
);

// Применять изменения сразу после сохранения настроек
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === "local") {
    const s = await getSettings();
    applyProxy(s);
  }
});

// Инициализация при старте сервис-воркера
(async () => {
  const s = await getSettings();
  applyProxy(s);
})();
