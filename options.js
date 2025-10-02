async function load() {
  const s = await chrome.storage.local.get({
    scheme: "HTTP", host: "", port: 0, username: "", password: ""
  });
  scheme.value = s.scheme;
  host.value = s.host;
  port.value = s.port || "";
  username.value = s.username || "";
  password.value = s.password || "";
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

document.addEventListener("DOMContentLoaded", load);
