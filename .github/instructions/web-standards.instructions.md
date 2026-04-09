---
applyTo: '**/*.ts, **/*.tsx'
---

# Typescript standards for prepper-box

## CSS Styling

- Always use SCSS Modules or main.scss for styling components. Do stack styles using multiple SCSS layers (e.g., component-level, feature-level, global-level).
- Use camelCase for CSS class names.
- when selecting a css class in a typescript file, use class name directly instead of bracket notation. E.g., `styles.myClassName` instead of `styles["my-class-name"]`.

## TypeScript Conventions

* Respect the ESLint rules defined in eslint.config.js.
* Avoid conversion like `as unknown as Type` unless absolutely necessary. If you find yourself needing to do this, consider if there is a better way to structure your types or code to avoid it.

## Naming conventions

* Respect the @typescript-eslint/naming-convention rules defined in eslint.config.js. In particular:
  * Use PascalCase for type names (e.g., `type User = { ... }`).
  * Use camelCase for variable and function names (e.g., `const userName = "John";`).
  * Use PascalCase for constants (e.g., `const MaxUsers = 100;`).

## React Component Conventions

- The order of imports in a React component file should be:
  1. React and related libraries (e.g., `import React from "react";`)
  2. Third-party libraries (e.g., `import { useSelector } from "react-redux";`)
  3. Application-wide imports (e.g., `import { RootState } from "@/store";`), with the following order:
     - Store imports (e.g., `import { RootState } from "@/store";`)
     - API imports (e.g., `import * as api from "@/api/api.generated";`)
     - Model imports (e.g., `import { ProductInfo } from "@/models/productInfo";`)
     - Utility imports (e.g., `import { formatDate } from "@/shared/dateUtils";`)
     - Component imports (e.g., `import { FormInputText } from "@/components/forms";`)
  4. Components from upper folder (e.g., `import AnotherComponent from "../anotherComponent";`)
  5. Local imports (e.g., `import AnotherComponent from "./anotherComponent";`)
  6. Styles (e.g., `import "./myComponent.module.scss";`)

## Tests

Do NOT write comprehensive unit tests. Do exactly as asked by the developer and keep the fundamental unit tests around:
- Test the rendering elements of a component
- Test the main logic of a function
- Test the standard business case scenarios
- Test the most likely edge cases

When testing for toasts, use the `fakeToast` utility from `src/utils/tests/fakeToast.ts` instead of mocking the toast functions directly. This ensures that your tests are consistent with how toasts are handled in the application.

**ALWAYS** select your screen elements by their `data-test_id` attributes in your tests. If an elements is missing, just add it to the component. Always use the format `ComponentName__Element_Description`, e.g., `LoginButton__Submit_Button`. Avoid selecting elements by content text.
