import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Courses from "./pages/Courses";
import Materials from "./pages/Materials";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import DashboardCourses from "./pages/DashboardCourses";
import DashboardActivities from "./pages/DashboardActivities";
import DashboardLibrary from "./pages/DashboardLibrary";
import DashboardCalendar from "./pages/DashboardCalendar";
import DashboardCertificates from "./pages/DashboardCertificates";
import DashboardProfile from "./pages/DashboardProfile";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/about"} component={About} />
      <Route path={"/courses"} component={Courses} />
      <Route path={"/materials"} component={Materials} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/dashboard/courses"} component={DashboardCourses} />
      <Route path={"/dashboard/activities"} component={DashboardActivities} />
      <Route path={"/dashboard/library"} component={DashboardLibrary} />
      <Route path={"/dashboard/calendar"} component={DashboardCalendar} />
      <Route path={"/dashboard/certificates"} component={DashboardCertificates} />
      <Route path={"/dashboard/profile"} component={DashboardProfile} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Navbar />
          <main className="pt-[72px] min-h-screen">
            <Router />
          </main>
          <Footer />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
