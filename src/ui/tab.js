const refresh = () => window.location.reload();

browser.management.onInstalled.addListener(refresh);
browser.management.onUninstalled.addListener(refresh);
browser.management.onEnabled.addListener(refresh);
browser.management.onDisabled.addListener(refresh);

window.onload = async () => {
  const extensions = (await browser.management.getAll()).filter(info => {
    // Only list extensions installed temporarily (and skip the manager extension itself).
    return info.type === "extension" && info.id !== browser.runtime.id;
  });

  const listEl = document.getElementById("extensions-list");
  listEl.innerHTML = "";

  if (extensions.length === 0) {
    listEl.textContent = "No temporary installed extension found yet.";
  }

  for (const extension of extensions) {
    const title = document.createElement("h2");
    title.textContent = extension.name;
    if (extension.installType === "development") {
      title.textContent += " (installed temporarily)";
    }
    listEl.appendChild(title);

    const button = document.createElement("button");
    button.textContent = "remove all";
    button.style = "margin-left: 1em;";
    button.onclick = async () => {
      await browser.extensionPermissionManager.removeAll(extension.id).then(refresh, (err) => {
        alert(`${err}`);
      });
    };
    title.appendChild(button);

    const pre = document.createElement("pre");
    pre.textContent = "Reading optional permissions...";
    listEl.appendChild(pre);

    await browser.extensionPermissionManager.list(extension.id).then(
      permissions => {
        pre.textContent = JSON.stringify(permissions, null, 2);
      },
      err => {
        pre.textContent = `Error reading optional permissions: ${err}`;
      });

    await browser.extensionPermissionManager.onPermissionChanged.addListener(refresh, extension.id);

    // Print the extension info for debugging purpose.
    // pre.textContent += "\n\n" + JSON.stringify(extension, null, 2);
  }
};
