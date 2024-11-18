import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { FavoritesProvider } from "./context/FavoritesContext.tsx";
import { ProfileImageProvider } from "./context/ProfileImageContext.tsx";
import { UserProvider } from "./context/UserContext.tsx";
import "./css/main.css";
import AboutPage from "./pages/AboutPage.tsx";
import ContactPage from "./pages/ContactPage.tsx";
import DetailsPage from "./pages/DetailsPage.tsx";
import ErrorPage from "./pages/ErrorPage.tsx";
import FavoritesPage from "./pages/FavoritesPage.tsx";
import GamesPage from "./pages/GamesPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import SearchResultsPage from "./pages/SearchResultsPage.tsx";
import SigninPage from "./pages/SigninPage.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/games", element: <GamesPage /> },
      { path: "/contact", element: <ContactPage /> },
      { path: "/favorites", element: <FavoritesPage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/signin", element: <SigninPage /> },
      { path: "/profile", element: <ProfilePage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/game/:id", element: <DetailsPage /> },
      { path: "/search-results/:query", element: <SearchResultsPage /> },
      { path: "*", element: <ErrorPage /> },
    ],
  },

  { path: "*", element: <ErrorPage /> },
]);

const theme = createTheme({});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <UserProvider>
        <ProfileImageProvider>
          <FavoritesProvider>
            <Notifications limit={5} />
            <RouterProvider router={router} />
          </FavoritesProvider>
        </ProfileImageProvider>
      </UserProvider>
    </MantineProvider>
  </React.StrictMode>
);
