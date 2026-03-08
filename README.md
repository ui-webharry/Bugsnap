# 🐞 BugSnap

A lightweight, standalone bug reporting SaaS that allows developers to collect visual feedback and bug reports from their users with automatic screenshots.

## 🚀 Features

- **Floating Bug Widget**: A professional widget that can be embedded on any website.
- **Automatic Screenshots**: Uses `html2canvas` to capture the user's screen state.
- **Developer Dashboard**: Manage, sort, and track bug reports from a central mission control.
- **Standalone Integration**: Just one line of code to add to any site.
- **Metadata Tracking**: Automatically captures URL, Browser info, and timestamps.

## 🛠️ Installation

To add BugSnap to your website, add this script to your `<head>` or before the closing `</body>` tag:

```html
<script src="https://ais-dev-sbo35wmhqbo5wq6j4su7hp-31369565493.europe-west3.run.app/widget.js"></script>
```

## 💻 Tech Stack

- **Frontend**: React 19, Tailwind CSS 4, Lucide Icons, Motion.
- **Backend**: Node.js, Express, Better-SQLite3.
- **Capture**: html2canvas.

## 🏗️ Architecture

- `server.ts`: Express server with SQLite database and Vite middleware.
- `src/widget-entry.tsx`: Entry point for the standalone widget build.
- `src/components/BugWidget.tsx`: The reporting interface.
- `src/components/Dashboard.tsx`: The admin management interface.

---
Built by **ui_webharry**
