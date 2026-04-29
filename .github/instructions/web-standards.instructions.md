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
* Avoid conversion like `as unknown as Type` or `as unknown as never` unless absolutely necessary. If you find yourself needing to do this, consider if there is a better way to structure your types or code to avoid it.

## Naming conventions

- Respect the @typescript-eslint/naming-convention rules defined in eslint.config.js. In particular:
  - Use PascalCase for type names (e.g., `type User = { ... }`).
  - Use camelCase for variable and function names (e.g., `const userName = "John";`).
  - Use PascalCase for constants (e.g., `const MaxUsers = 100;`).

## React Component Conventions

- The order of imports in a React component file should be:
  1. React and related libraries (e.g., `import React from "react";`)
  2. Third-party libraries (e.g., `import { useSelector } from "react-redux";`)
  3. Imports from `atom-web` packages (e.g., `import { callApi } from "@hwndmaster/atom-react-redux";`)
  4. Application-wide imports (e.g., `import { RootState } from "@/store";`), with the following order:
     - Store imports (e.g., `import { RootState } from "@/store";`)
     - API imports (e.g., `import * as api from "@/api/api.generated";`)
     - Model imports (e.g., `import { ProductInfo } from "@/models/productInfo";`)
     - Utility imports (e.g., `import { formatDate } from "@/shared/dateUtils";`)
     - Component imports (e.g., `import { FormInputText } from "@/components/forms";`)
  5. Components from upper folder (e.g., `import AnotherComponent from "../anotherComponent";`)
  6. Local imports (e.g., `import AnotherComponent from "./anotherComponent";`)
  7. Styles (e.g., `import "./myComponent.module.scss";`)
- API cannot be used directly in a component. Instead, create an action in the store, bind it to a saga that calls the API, and then call that action from the component.

## Tests

Do NOT write comprehensive unit tests. Do exactly as asked by the developer and keep the fundamental unit tests around:
- Test the rendering elements of a component
- Test the main logic of a function
- Test the standard business case scenarios
- Test the most likely edge cases

**ALWAYS** select your screen elements by their `data-test_id` attributes in your tests. If an elements is missing, just add it to the component. Always use the format `ComponentName__Element_Description`, e.g., `LoginButton__Submit_Button`. Avoid selecting elements by content text.

## On demand running
* If you need NSwag to rerun, you can ask me to do so by saying "Please rerun NSwag". I'll do that for you and then you can continue with your work.

## Atom-web packages

* packages under "@hwndmaster" scope are called atom-web packages.
* If you need to update the code of any of the atom-web packages, ask me first and then you can proceed with changes in atom-web packages. After you have made the changes, ask me to publish the new versions of the atom-web packages and then you can continue with your work. It could be that I may want to publish them later, so give me the freedom to decide when to publish the new versions of the atom-web packages. If I decide to publish later, then assume that the new versions of the atom-web packages will contain the changes you have made and you can continue with your work without waiting for the new versions of the atom-web packages to be published.
