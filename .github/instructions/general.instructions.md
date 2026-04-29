---
applyTo: '**'
---

# General instructions for prepper-box

* Never do any modification actions directly in Git, like `git push` or `git rebase` or `git merge` or `git add` or `git commit`. Always ask for help if you need to do any Git operations.

## Project Structure

* /PrepperBox.Core: Contains the core functionality, infrastructure, and shared types such as enumerations.
* /PrepperBox.Db: Contains the data access layer using Entity Framework Core.
* /PrepperBox.WebApi: Contains the backend API built with ASP.NET Core.
* /PrepperBox.Web: Contains the frontend application built with React and TypeScript.
