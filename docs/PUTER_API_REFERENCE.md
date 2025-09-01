# Puter API Reference (UBULITE)

This document consolidates the Puter.js utilities and UI functions for UBULITE integration. It provides both detailed examples and concise references for engineering use.

**NOTE**: This is a reference summary for engineering use — always confirm the canonical Puter docs (js.puter.com/v2) before production rollout.

## Core Utilities

### puter.print(value)
Prints to Puter console/output. Useful for quick demos and debugging.

**Example:**
```html
<script>puter.print("Hello from Puter!");</script>
```

### puter.randName()
Returns a random human-readable name (useful for demo resources).

**Example:**
```js
const demoName = puter.randName();
puter.print("Generated name: " + demoName);
```

### puter.appID
Property returning the current app ID.

**Example:**
```html
<script>puter.print("App ID: " + puter.appID);</script>
```

### puter.env
Access environment variables exposed by Puter runtime (read-only in client contexts).

**Example:**
```js
const envVars = puter.env;
console.log("Environment:", envVars);
```

## Drivers

### puter.drivers.call(interface, driver, method, args = {})
Low-level driver invocation for system-level operations.

**Example:**
```js
const result = await puter.drivers.call('filesystem', 'local', 'readFile', {
  path: '/path/to/file.txt'
});
```

## UI Helpers

### puter.ui.prompt(message?, placeholder?)
Shows a prompt dialog. Returns Promise<string|null>.

**Example:**
```js
const userInput = await puter.ui.prompt("Enter your name:", "John Doe");
if (userInput) {
  puter.print("Hello, " + userInput);
}
```

### puter.ui.alert(message, buttons?)
Shows modal alerts. Resolves to pressed button value.

**Example:**
```js
const choice = await puter.ui.alert("Save changes?", ["Yes", "No", "Cancel"]);
if (choice === "Yes") {
  // Save logic here
}
```

### puter.ui.contextMenu(options)
Creates dynamic context menus.

**Example:**
```js
puter.ui.contextMenu({
  items: [
    { label: "Copy", action: () => copy() },
    { label: "Paste", action: () => paste() },
    { separator: true },
    { label: "Delete", action: () => delete() }
  ]
});
```

### File Pickers

#### puter.ui.showOpenFilePicker() / puter.ui.showSaveFilePicker()
File picker dialogs for opening and saving files.

**Example:**
```js
const file = await puter.ui.showOpenFilePicker();
if (file) {
  const content = await file.text();
  puter.print("File content: " + content);
}
```

#### puter.ui.showDirectoryPicker()
Directory picker for folder selection.

**Example:**
```js
const directory = await puter.ui.showDirectoryPicker();
if (directory) {
  puter.print("Selected directory: " + directory.name);
}
```

### Window Management

#### puter.ui.createWindow(options)
Creates additional windows with customizable options.

**Options:**
- `title` - Window title
- `width`, `height` - Window dimensions
- `center` - Center the window
- `content` - HTML content
- `has_head` - Show title bar
- `is_resizable` - Allow resizing
- `disable_parent_window` - Modal behavior
- `show_in_taskbar` - Taskbar visibility

**Example:**
```js
const newWindow = await puter.ui.createWindow({
  title: "UBULITE Dashboard",
  width: 800,
  height: 600,
  center: true,
  content: "<h1>Welcome to UBULITE</h1>",
  has_head: true,
  is_resizable: true
});
```

### Application Lifecycle

#### puter.ui.wasLaunchedWithItems()
Check if the app was launched with file items.

#### puter.ui.parentApp()
Get reference to parent application.

#### puter.ui.launchApp(appName, options)
Launch another Puter application.

#### puter.ui.on(eventName, handler)
Event listener registration.

#### puter.ui.onWindowClose(handler)
Handle window close events.

#### puter.ui.getLanguage()
Get current language setting.

#### puter.ui.exit()
Exit the application.

## AI Integration

### puter.ai.chat(prompt, options)
AI chat functionality with model selection.

**Example:**
```js
const response = await puter.ai.chat("Explain quantum computing", {
  model: "gpt-4"
});
puter.print("AI Response: " + response);
```

## Integration Patterns

### Client-First Flow
Try Puter client first, fallback to server when needed.

```js
async function performAIChat(prompt, model = "gpt-3.5-turbo") {
  if (window.FEAT_PUTER && typeof puter !== 'undefined') {
    // Use Puter's AI capabilities
    return await puter.ai.chat(prompt, { model });
  } else {
    // Fallback to server endpoint
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model })
    });
    
    if (response.status === 502) {
      throw new Error("No API key configured - please use client-side model");
    }
    
    return await response.json();
  }
}
```

### Error Handling
Server returns 502 if no OPENAI_API_KEY to allow user-pay client flows.

```js
try {
  const result = await performAIChat("Hello");
} catch (error) {
  if (error.message.includes("No API key")) {
    // Prompt user to configure API key or use client model
    puter.ui.alert("Please configure API key or use client-side AI model");
  }
}
```

## Testing Checklist

- [ ] Verify client path works with Puter runtime
- [ ] Confirm server returns 502 when API key absent
- [ ] Test server response when API key present
- [ ] Validate UI behaviors (prompts, alerts, windows)
- [ ] Check file picker functionality
- [ ] Test window creation and management
- [ ] Verify AI integration works both client and server-side

## Security Considerations

- Always validate user inputs before processing
- Sanitize file paths and names
- Use proper error handling for AI requests
- Implement rate limiting for AI calls
- Validate file types and sizes in file pickers

## Performance Tips

- Cache frequently accessed environment variables
- Use async/await for all UI operations
- Implement proper cleanup in window close handlers
- Optimize AI prompt lengths
- Use appropriate window sizes for better UX

## References

- **Puter Canonical Docs**: [js.puter.com/v2](https://js.puter.com/v2)
- **OpenAI API Docs**: [platform.openai.com/docs](https://platform.openai.com/docs)
- **UBULITE Integration Examples**: See `/examples` directory