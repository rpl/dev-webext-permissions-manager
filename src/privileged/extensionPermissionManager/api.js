/* global AddonManager, Cu, ChromeUtils, ExtensionAPI, ExtensionCommon, ExtensionPermissions,
          Services */

/* eslint-disable no-invalid-this */

ChromeUtils.defineModuleGetter(
  this,
  "AddonManager",
  "resource://gre/modules/AddonManager.jsm"
);
ChromeUtils.defineModuleGetter(
  this,
  "ExtensionPermissions",
  "resource://gre/modules/ExtensionPermissions.jsm"
);
ChromeUtils.defineModuleGetter(
  this,
  "Services",
  "resource://gre/modules/Services.jsm"
);

ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");
const { EventManager } = ExtensionCommon;

this.extensionPermissionManager = class ExtensionPermissionManagerAPI extends ExtensionAPI {
  /**
   * @param {object} context the addon context
   * @returns {object} the experiment API methods.
   */
  getAPI(context) {
    const { extension: selfExtension } = this;
    const { WebExtensionPolicy } = Cu.getGlobalForObject(Services);
    const getExtensionByID = async extensionId => {
      const addon = await AddonManager.getAddonByID(extensionId);

      if (!addon) {
        return Promise.reject({ message: "Extension not found" });
      }

      if (!addon.isActive) {
        return Promise.reject({
          message:
            "Unable to manage optional permissions for a disabled extension"
        });
      }

      const policy = WebExtensionPolicy.getByID(extensionId);

      if (!policy) {
        return Promise.reject({ message: "Extension not found" });
      }

      return [policy.extension, addon];
    };

    return {
      extensionPermissionManager: {
        async list(extensionId) {
          const [extension] = await getExtensionByID(extensionId);

          return ExtensionPermissions.get(extension);
        },
        async removeAll(extensionId) {
          if (selfExtension.id === extensionId) {
            return Promise.reject({
              message:
                "Cannot remove permissions on the extension manger extension"
            });
          }
          const [extension, addon] = await getExtensionByID(extensionId);

          await ExtensionPermissions.removeAll(extension);
          await addon.reload();

          return Promise.resolve();
        },
        onPermissionChanged: new EventManager(
          context,
          "extensionPermissionManager.onPermissionChanged",
          (fire, extensionId) => {
            const policy = WebExtensionPolicy.getByID(extensionId);

            if (!policy) {
              return () => {}; // eslint-disable-line no-empty-function
            }

            const { extension } = policy;
            const listener = (changeType, change) => {
              fire.async(changeType, change);
            };
            const listenerAdded = listener.bind(null, "added");
            const listenerRemoved = listener.bind(null, "removed");

            extension.on("remove-permissions", listenerRemoved);
            extension.on("add-permissions", listenerAdded);

            const unsubscribe = () => {
              extension.off("remove-permissions", listenerRemoved);
              extension.off("add-permissions", listenerAdded);
            };

            extension.once("shutdown", unsubscribe);

            return unsubscribe;
          }
        ).api()
      }
    };
  }
};
