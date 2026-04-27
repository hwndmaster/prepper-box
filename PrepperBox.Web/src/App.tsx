import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { LoadingSpinner } from "@hwndmaster/atom-react-redux";
import { ToastProvider } from "@hwndmaster/atom-react-prime";
import { ConfirmDialog, PrimeReactProvider } from "@/primereact";

import { setupAxiosInstances } from "./api/setup";
import RootComponent from "./RootComponent";
import { getPersistor } from "./store";
import { getStore } from "./store/setup";
import LoadingTargets from "./shared/loadingTargets";

import "primereact/resources/themes/viva-dark/theme.css";
import "primeicons/primeicons.css";
import "./styles/main.scss";

setupAxiosInstances();

const App: React.FC = () => {
    return (
        <Provider store={getStore()}>
            <PersistGate loading={null} persistor={getPersistor()}>
                <PrimeReactProvider>
                    <ConfirmDialog />
                    <ToastProvider>
                        <LoadingSpinner target={LoadingTargets.WholePage}>
                            <RootComponent />
                        </LoadingSpinner>
                    </ToastProvider>
                </PrimeReactProvider>
            </PersistGate>
        </Provider>
    );
};

export default App;
