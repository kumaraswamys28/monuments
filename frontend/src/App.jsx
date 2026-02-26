import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { EmptyInputGroup } from "./components/Ppage.jsx";
import Layouts from "./components/Layout/Layouts.jsx";
import Home from "./components/Layout/Home.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/model/:id" element={<Layouts />} />
        <Route path="/*" element={<EmptyInputGroup />} />
        <Route path="/" element={<Home/>} />
      </Routes>
    </Router>
  );
}

export default App;
