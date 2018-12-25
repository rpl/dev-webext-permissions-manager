/* global AddonManager, Cu, ExtensionPermissions */

ChromeUtils.defineModuleGetter(this, "AddonManager", "resource://gre/modules/AddonManager.jsm");
ChromeUtils.defineModuleGetter(this, "ExtensionPermissions", "resource://gre/modules/ExtensionPermissions.jsm");
ChromeUtils.defineModuleGetter(this, "Services", "resource://gre/modules/Services.jsm");

this.extensionPermissionManager = class ExtensionPermissionManagerAPI extends ExtensionAPI {
  /**
   * @param {object} context the addon context
   * @returns {object} the experiment API methods.
   */
  getAPI(context) {
    const {extension} = this;

    const {WebExtensionPolicy} = Cu.getGlobalForObject(Services);

    async function getExtensionByID(extensionId) {
      const addon = await AddonManager.getAddonByID(extensionId);
      if (!addon) {
        return Promise.reject({message: "Extension not found"});
      }

      if (!addon.isActive) {
        return Promise.reject({
          message: "Unable to manage optional permissions for a disabled extension",
        });
      }

      const policy = WebExtensionPolicy.getByID(extensionId);

      if (!policy) {
        return Promise.reject({message: "Extension not found"});
      }

      return [policy.extension, addon];
    }

    return {
      extensionPermissionManager: {
        async list(extensionId) {
          const [extension] = await getExtensionByID(extensionId);
          return ExtensionPermissions.get(extension);
        },
        async removeAll(extensionId) {
          const [extension, addon] = await getExtensionByID(extensionId);
          await ExtensionPermissions.removeAll(extension);
          await addon.reload();
        }
      },
    };
  }
};
