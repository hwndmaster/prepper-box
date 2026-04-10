import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppRoutes from "./shared/routes";
import Layout from "./components/layout/Layout";
import Home from "./pages/home";
import Categories from "./pages/categories";
import StorageLocations from "./pages/storageLocations";
import ConsumptionLogs from "./pages/consumptionLogs";
import AddProduct from "./pages/addProduct";
import EditProduct from "./pages/editProduct";
import AddTrackedProduct from "./pages/addTrackedProduct";
import Error from "./pages/error";
import NotFound from "./pages/notFound";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        errorElement: <Error />,
        children: [
            {
                path: AppRoutes.Default.path,
                element: <Home />,
            },
            {
                path: AppRoutes.Categories.path,
                element: <Categories />,
            },
            {
                path: AppRoutes.StorageLocations.path,
                element: <StorageLocations />,
            },
            {
                path: AppRoutes.AddProduct.path,
                element: <AddProduct />,
            },
            {
                path: AppRoutes.EditProduct.path,
                element: <EditProduct />,
            },
            {
                path: AppRoutes.AddTrackedProduct.path,
                element: <AddTrackedProduct />,
            },
            {
                path: AppRoutes.ConsumptionLogs.path,
                element: <ConsumptionLogs />,
            },
            {
                path: "*",
                element: <NotFound />,
            },
        ],
    },
]);

const RootComponent: React.FC = () => {
    return <RouterProvider router={router} />;
};

export default RootComponent;
