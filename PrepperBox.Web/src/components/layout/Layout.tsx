import React, { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menubar } from "primereact/menubar";
import type { MenuItem } from "primereact/menuitem";
import AppRoutes, { getCurrentRoute, goTo } from "@/shared/routes";
import LoadingTargets from "@/shared/loadingTargets";
import { LoadingSpinner } from "../loadingSpinner";
import "./layout.module.scss";

const routeTitles = new Map([
    [AppRoutes.Default.path, "Prepper Box"],
    [AppRoutes.Categories.path, "Categories"],
    [AppRoutes.StorageLocations.path, "Storage Locations"],
    [AppRoutes.AddProduct.path, "Add Product"],
    [AppRoutes.EditProduct.path, "Edit Product"],
    [AppRoutes.AddTrackedProduct.path, "Add Tracked Product"],
]);

const Layout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems: MenuItem[] = [
        {
            label: "Home",
            icon: "pi pi-home",
            command: () => void goTo(navigate, AppRoutes.Default),
        },
        {
            label: "Categories",
            icon: "pi pi-tags",
            command: () => void goTo(navigate, AppRoutes.Categories),
        },
        {
            label: "Storage Locations",
            icon: "pi pi-warehouse",
            command: () => void goTo(navigate, AppRoutes.StorageLocations),
        }
    ];

    const pageTitle = useMemo(() => {
        const defaultTitle = "Prepper Box";
        const currentRoute = getCurrentRoute(location);
        if (currentRoute == null) return defaultTitle;
        return routeTitles.get(currentRoute.path) ?? defaultTitle;
    }, [location]);

    const end = (
        <div className="flex align-items-center gap-2">
            <span className="font-bold">{pageTitle}</span>
        </div>
    );

    return (
        <div className="layout-container">
            <Menubar model={menuItems} end={end} className="layout-menubar" />

            <div className="layout-content">
                <LoadingSpinner target={LoadingTargets.ActiveView}>
                    <Outlet />
                </LoadingSpinner>
            </div>
        </div>
    );
};

export default Layout;
