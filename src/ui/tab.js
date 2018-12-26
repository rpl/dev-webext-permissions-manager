// import choo's template helper
import html from "nanohtml";
import morph from "nanomorph";

const UI = {
  noExtensionsFound() {
    return html`
      <div class="card">
        <div class="card-body">
          <p>
            No extension found. This page will be updated automatically once an
            extension is installed.
          </p>
        </div>
      </div>
    `;
  },
  extensionCard({ extension, cardBody, onRemoveAll }) {
    const titleSuffix =
      extension.installType === "development" ? " (installed temporarily)" : "";

    return html`
      <div class="card">
        <div class="card-header">
          <h3>${extension.name}</h3>
          <b>${extension.id}<small> ${titleSuffix}</small></b>
        </div>
        <div class="card-body">${cardBody}</div>
        <div class="card-footer">
          <button onclick=${onRemoveAll}>clear permissions and reload</button>
        </div>
      </div>
    `;
  }
};

const ACTIONS = {
  reloadPage() {
    window.location.reload();
  },
  async getExtensionsList() {
    return (await browser.management.getAll()).filter(
      info => info.type === "extension" && info.id !== browser.runtime.id
    );
  },
  getContainerElement() {
    return document.getElementById("extensions-list");
  },
  removeAllPermissionsAndReload(extensionId) {
    return browser.extensionPermissionManager.removeAll(extensionId);
  },
  listPermissions(extensionId) {
    return browser.extensionPermissionManager.list(extensionId);
  },
  subscribeInstalledExtensionChanges() {
    browser.management.onInstalled.addListener(ACTIONS.reloadPage);
    browser.management.onUninstalled.addListener(ACTIONS.reloadPage);
    browser.management.onEnabled.addListener(ACTIONS.reloadPage);
    browser.management.onDisabled.addListener(ACTIONS.reloadPage);
  },
  subscribePermissionChanged(extensionId, listener) {
    browser.extensionPermissionManager.onPermissionChanged.addListener(
      listener,
      extensionId
    );
  },
  async renderPage() {
    // Only list extensions installed temporarily (and skip the manager
    // extension itself).
    const extensions = await ACTIONS.getExtensionsList();

    const listEl = ACTIONS.getContainerElement();

    listEl.innerHTML = "";

    if (extensions.length === 0) {
      listEl.appendChild(UI.noExtensionsFound());

      return;
    }

    for (const extension of extensions) {
      const onRemoveAll = () => {
        ACTIONS.removeAllPermissionsAndReload(extension.id).then(
          ACTIONS.reloadPage,
          err => {
            alert(`Unexpected error: ${err}`); // eslint-disable-line no-alert
          }
        );
      };
      const cardParams = {
        extension,
        cardBody: html`
          <pre>Reading optional permissions...</pre>
        `,
        onRemoveAll
      };
      const extensionCard = UI.extensionCard(cardParams);

      listEl.appendChild(extensionCard);

      ACTIONS.listPermissions(extension.id).then(
        permissions => {
          morph(
            extensionCard,
            UI.extensionCard({
              ...cardParams,
              cardBody: html`
                <pre>${JSON.stringify(permissions, null, 2)}</pre>
              `
            })
          );
        },
        err => {
          morph(
            extensionCard,
            UI.extensionCard({
              ...cardParams,
              cardBody: html`
                <p style="color: red;">
                  Error reading optional permissions: \n${err.toString()}
                </p>
              `
            })
          );
        }
      );

      ACTIONS.subscribePermissionChanged(extension.id, ACTIONS.reloadPage);
    }
  }
};

ACTIONS.subscribeInstalledExtensionChanges();

window.onload = () => {
  ACTIONS.subscribeInstalledExtensionChanges();
  ACTIONS.renderPage();
};
