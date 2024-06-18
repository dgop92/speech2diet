import { Route, Routes } from "react-router-dom";
import { HomePage } from "../pages/Home";
import { NotFoundPage } from "../pages/NotFound";

export default function MainRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
