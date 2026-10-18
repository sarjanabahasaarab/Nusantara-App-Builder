# Hello Component Plugin for Nusantara App Builder

Example third-party plugin demonstrating how to create and register custom Android components in Nusantara App Builder Visual Designer.

## Plugin Structure

```
hello-component/
├── manifest.json   # Plugin metadata, API version, and permission declarations
├── src/
│   └── index.ts    # Component registration and event bindings
└── README.md       # Developer documentation
```

## Permissions Requested

- `project.read`: Required to inspect existing layouts.
- `project.write`: Required to register the custom `HelloCard` widget in the Component Palette.

## Manifest Definition

```json
{
  "id": "example.hello-card",
  "name": "Hello Component Plugin",
  "version": "1.0.0",
  "apiVersion": "1",
  "author": "Nusantara Open Source Ecosystem",
  "category": "component",
  "permissions": ["project.read", "project.write"]
}
```

## Installation

1. Open **Extensions** in the Nusantara App Builder sidebar.
2. Click **Install Plugin** and paste this `manifest.json`.
3. Accept the permission prompt to register `HelloCard`.
