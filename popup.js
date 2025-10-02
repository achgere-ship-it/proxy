async function load() {
  const s = await chrome.storage.local.get({
    enabled: false, scheme: "HTTP", host: "", port: 0, username: "", password: ""
  });
  scheme.value = s.scheme;
  host.value = s.host;
  port.value = s.port || "";
  username.value = s.username || "";
  password.value = s.password || "";
  status.textContent = s.enabled ? "Статус: ВКЛ" : "Статус: ВЫКЛ";
}

save.onclick = async () => {
  const s = {
    scheme: scheme.value,
    host: host.value.trim(),
    port: Number(port.value),
    username: username.value.trim(),
    password: password.value
  };
  await chrome.storage.local.set(s);
  status.textContent = "Сохранено";
};

toggle.onclick = async () => {
  const cur = await chrome.storage.local.get({ enabled: false });
  await chrome.storage.local.set({ enabled: !cur.enabled });
  const next = await chrome.storage.local.get({ enabled: false });
  status.textContent = next.enabled ? "Статус: ВКЛ" : "Статус: ВЫКЛ";
};

options.onclick = () => chrome.runtime.openOptionsPage();

document.addEventListener("DOMContentLoaded", load);
