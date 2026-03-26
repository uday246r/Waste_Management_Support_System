import React from "react";
import NavBar from "./components/NavBar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Body from "./components/Body";
import Login from "./components/Login";
import Gate from "./components/Gate";
import GateGuard from "./components/GateGuard";
import Profile from "./components/Profile";
import { Provider } from "react-redux";
import appStore from "./utils/appStore";
import Feed from "./components/Feed";
// import CompanyFeed from "./components/companyFeed";
import Home from "./components/Home";
import Connections from "./components/connections";
import Requests from "./components/Requests";
import PickupRequests from "./components/PickupRequests";
import Video from "./components/Video";
import AboutUs from "./components/About";
import Footer from "./components/Footer";
import ContactUs from "./components/Contact";
import RealChat from "./components/RealChat";
import Transactions from "./components/Transactions";

function App() {
  return (
    <Provider store={appStore}>
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/gate" element={<Gate />} />
          <Route path="/" element={<Body />}>
            <Route index element={<Home />} />
            {/* <Route path="companies" element={<CompanyFeed />} /> */}
            <Route path="login" element={<GateGuard><Login /></GateGuard>} />
            <Route path="profile" element={<Profile />} />
            <Route path="videos" element={<Video />} />
            <Route path="connections" element={<Connections />} />
            <Route path="connections/chat/:connectionId" element={<RealChat />} />
            <Route path="requests" element={<Requests />} />
            <Route path="pickuprequest" element={<PickupRequests />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="about" element={<AboutUs />} />
            <Route path="contact" element={<ContactUs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
