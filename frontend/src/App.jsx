import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { EmptyInputGroup } from "./components/Ppage.jsx";
import Layouts from "./components/Layout/Layouts.jsx";
import Home from "./components/Layout/Home.jsx";
import Dashboard from "./components/Layout/Dashboard/Dashboard.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/model/:id" element={<Layouts />} />
        <Route path="/model/:id/dashboard" element={<Dashboard />}/>
        <Route path="/*" element={<EmptyInputGroup />} />
        <Route path="/" element={<Home/>} />
      </Routes>
    </Router>
  );
}

export default App;
