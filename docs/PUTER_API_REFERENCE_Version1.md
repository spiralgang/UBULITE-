```markdown
# Puter API — concise reference (UBULITE)

This document consolidates the Puter.js utilities and UI functions referenced in our integration demo. It intentionally omits repeated tutorial pages and keeps one short example per API to make review and testing fast.

NOTE: This is a reference summary for engineering use — always confirm the canonical Puter docs (js.puter.com/v2) before production rollout.

## Utilities
- puter.print(value)
  - Prints to Puter console/output. Useful for quick demos.
  - Example:
    ```html
    <script>puter.print("Hello from Puter!");</script>
    ```

- puter.randName()
  - Returns a random human-readable name (useful for demo resources).

- puter.appID
  - Property returning the current app ID.
  - Example:
    ```html
    <script>puter.print("App ID: " + puter.appID);</script>
    ```

- puter.env
  - Access environment variables exposed by Puter runtime (read-only in client contexts).

## Drivers
- puter.drivers.call(interface, driver, method, args = {})
  - Low-level driver invocation; returns a Promise resolving with driver result.
  - Use only when high-level API lacks needed capability.

## UI helpers (selected)
These are the UI primitives used in desktop-like Puter apps. Examples are minimal — use them inside user-triggered handlers where noted (some open popups and require user gesture).

- puter.ui.prompt(message?, placeholder?)
  - Returns Promise resolving to string or null (cancel).
  - Example:
    ```js
    puter.ui.prompt('Enter name:', 'Jane').then(v => console.log(v));
    ```

- puter.ui.alert(message, buttons?)
  - Shows modal alert; resolves with pressed button value.

- puter.ui.contextMenu(options)
  - Show context menu at cursor; `options.items` is an array of items or '-' separators.
  - Items can include `label`, `action` (client callback), `icon`, `disabled`, `items` (submenu).

- puter.ui.showOpenFilePicker(options?) / showSaveFilePicker(data?, defaultFileName?)
  - File picker APIs; return FSItem(s) or file handle.

- puter.ui.showDirectoryPicker(options?)
  - Directory picker returns FSItem for folder.

- puter.ui.showFontPicker() / showColorPicker()
  - Return selected font or color value.

- puter.ui.createWindow(options)
  - Create an additional window; options: title, width, height, center, content, has_head, is_resizable, disable_parent_window, show_in_taskbar.

- puter.ui.setWindowX(x) / setWindowY(y) / setWindowWidth(w) / setWindowHeight(h) / setWindowSize(w,h) / setWindowPosition(x,y) / setWindowTitle(title)
  - Window control helpers (desktop app style). Validate min sizes in UI layer.

- puter.ui.setMenubar(options)
  - Create a menubar; `options.items` is an array of menu definitions (label/action/items).

- puter.ui.wasLaunchedWithItems()
  - Returns boolean indicating whether app was launched to open items.

- puter.ui.parentApp()
  - Returns AppConnection to parent app (or null).

- puter.ui.launchApp(appName?, args?)
  - Launch another app or a new instance.

- puter.ui.on(eventName, handler)
  - Subscribe to broadcasts (e.g., `localeChanged`, `themeChanged`).

- puter.ui.onWindowClose(handler)
  - Register handler fired before window close (not called for puter.exit()).

- puter.ui.getLanguage()
  - Returns Promise resolving to current locale code (e.g., 'en').

- puter.exit()
  - Terminate running application.

## Patterns & guidance for UBULITE integration
- Client-first flow (examples/puter-integration.html):
  - Try Puter client if window.FEAT_PUTER && puter available.
  - If client call fails or puter missing, fallback to server proxy: POST /api/ai/chat.
  - Server proxy returns 502 when no OPENAI_API_KEY to signal clients to use Puter direct (user-pays flow).

- UX & security:
  - Any feature exposing Puter user-pay functionality must show explicit user opt-in and billing clarity.
  - Do not embed server API keys in client code. Protect server endpoints with auth and rate-limiting.

## Minimal code snippets

- Example: detect Puter and call client or server fallback
```js
if (window.FEAT_PUTER && typeof puter !== 'undefined') {
  await puter.ai.chat(prompt, { model });
} else {
  await fetch('/api/ai/chat', { method:'POST', body: JSON.stringify({prompt,model}) });
}
```

- Example: basic context menu
```js
puter.ui.contextMenu({
  items: [
    { label: 'Open', action: () => console.log('Open') },
    '-', 
    { label: 'Delete', action: () => console.log('Delete') }
  ]
});
```

## Testing checklist (short)
- Client-only: load examples/puter-integration.html with the Puter script reachable and confirm responses.
- No server key: confirm POST /api/ai/chat returns 502 with clear message.
- With OPENAI_API_KEY: POST /api/ai/chat returns { text } from OpenAI.
- UI: interact with menu, pickers, and prompt dialogs to confirm callbacks.

## Acceptance criteria (for PR)
- Single example file (examples/puter-integration.html) exists and works with Puter client or server fallback.
- Server proxy module is present in src/server/puter-proxy.js and returns 502 if OPENAI_API_KEY missing.
- Documentation updated with this Puter API reference and short testing checklist.

## References
- /reference (project vault) — canonical standards and internal guidance.
- Puter client script reference: https://js.puter.com/v2/ (verify canonical URL before production)
- OpenAI API docs: https://platform.openai.com/docs
```