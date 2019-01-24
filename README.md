"Extension Permissions Manager" WebExtension
========================================================

This repository contains a small webextension which provides a Firefox sidebar to inspect (and clear)
[optional permissions][optional-permissions] granted to the installed and enabled extensions.

Let's say you've built an extension but you want to make the
[`history`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/history)
API [optional][optional-permissions] for your users. How do you verify that your extension behaves
correctly when the user does not grant access to the `history` API?
This is a developer tool designed for such a scenario.

![Screenshot Extension Permissions Manager sidebar][screenshot-sidebar]

The extension is meant to be used during the extension development to aid optional permissions testing,
and it can't be installed on a release Firefox version as it uses an WebExtensions Experiment API.

You can download the extension xpi from the [github releases][github-releases] and install the extension
temporarily from "about:debugging" on a [Firefox Nightly or DevEdition builds][firefox-downloads], or
permenantly from "about:addons" after you have set the following preferences in "about:config":

- `extensions.legacy.enabled`: `true`,
- `xpinstall.signatures.required`: `false`

[github-releases]: https://github.com/rpl/dev-webext-permissions-manager/releases
[firefox-downloads]: https://www.mozilla.org/en-US/firefox/channel/desktop/
[screenshot-sidebar]: https://raw.githubusercontent.com/rpl/dev-webext-permissions-manager/master/doc/screenshot-sidebar.png
[optional-permissions]: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/optional_permissions
