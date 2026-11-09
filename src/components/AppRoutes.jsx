/**
 * 🌳 SYSTEM: IRMINSUL FANTASY RPG - CLIENT ROUTING TABLE
 * ==========================================================
 * @file AppRoutes.jsx
 * @path fontend/src/components/AppRoutes.jsx
 * @description Registers application routes using React Router DOM, linking URLs to
 * page components (Home, Search, Details, Reader, Authentication, Profile, Deposit, Admin Panel).
 * ==========================================================
 */

import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Search from "./Search";
import Detail from "./Detail";
import Read from "./Read/Read";
import Login from "./Auth/Login";
import Register from "./Auth/Register";
import ForgotPassword from "./Auth/ForgotPassword";
import ResetPassword from "./Auth/ResetPassword";
import CategoryPage from "./CategoryPage";
import ProfileContainer from "./Profile/ProfileContainer";
import AdminUserManager from "../admin/AdminDashboard";
import { API_BASE_URL } from "../../config";

import TranslatorDashboard from "./Translator/TranslatorDashboard";
import HotComics from "./HotComics";
import CompletedComics from "./CompletedComics";
import DepositPage from "./Money/DepositPage";

const AppRoutes = ({
  user,
  handleLogin,
  handleLogout,
  categories,
  selectedCategory,
  setSelectedCategory,
}) => (
  <Routes>
    <Route path="/login" element={<Login onLogin={handleLogin} />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route
      path="/"
      element={
        <Home
          selectedCategory={selectedCategory}
          categories={categories}
          onSelectCategory={setSelectedCategory}
          user={user}
        />
      }
    />
    <Route
      path="/the-loai"
      element={<CategoryPage categories={categories} />}
    />
    <Route
      path="/the-loai/:slug"
      element={<CategoryPage categories={categories} />}
    />
    <Route path="/hot" element={<HotComics />} />
    <Route path="/full" element={<CompletedComics />} />
    <Route path="/search" element={<Search />} />
    <Route path="/truyen/:slug" element={<Detail user={user} />} />
    <Route path="/doc/:slug/:chapter" element={<Read user={user} />} />
    <Route
      path="/profile"
      element={<ProfileContainer user={user} onLogout={handleLogout} />}
    />
    <Route
      path="/deposit"
      element={<DepositPage />}
    />
    <Route
      path="/translator"
      element={<TranslatorDashboard user={user} />}
    />
    <Route
      path="/admin"
      element={<AdminUserManager user={user} />}
    />
    <Route
      path="/admin/users"
      element={<AdminUserManager user={user} />}
    />
    <Route
      path="/admin/*"
      element={<AdminUserManager user={user} />}
    />
  </Routes>
);

export default AppRoutes;
