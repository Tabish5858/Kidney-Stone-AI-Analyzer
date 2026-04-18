import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { SOLUTION_PAGES } from "./content/siteContent";
import "./index.css";
import AnalyzerPage from "./pages/AnalyzerPage";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import NotFoundPage from "./pages/NotFoundPage";
import SolutionPage from "./pages/SolutionPage";
import SolutionsHubPage from "./pages/SolutionsHubPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/analyzer" element={<AnalyzerPage />} />
        <Route path="/solutions" element={<SolutionsHubPage />} />
        {SOLUTION_PAGES.map((page) => (
          <Route
            key={page.slug}
            path={`/solutions/${page.slug}`}
            element={<SolutionPage page={page} />}
          />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
