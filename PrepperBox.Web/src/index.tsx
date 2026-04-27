import React from "react";
import { createRoot } from "react-dom/client";
import { setNotificationService } from "@hwndmaster/atom-react-redux";
import { toastService } from "@hwndmaster/atom-react-prime";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

setNotificationService(toastService);

const root = createRoot(document.getElementById("root")!);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
