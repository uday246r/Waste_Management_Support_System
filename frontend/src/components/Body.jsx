import React, { useEffect } from 'react';
import NavBar from './NavBar';
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import Footer from './Footer';
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from "../utils/userSlice";
import { addCompany } from "../utils/companySlice";
import Chat from './chat';

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const userData = useSelector((store) => store.user);
  const companyData = useSelector((store) => store.company);

  const [isAuthenticating, setIsAuthenticating] = React.useState(true);

  useEffect(() => {
    const fetchUserOrCompany = async () => {
      try {
        const res = await axios.get(BASE_URL + "/profile/view", {
          withCredentials: true,
        });
        dispatch(addUser(res.data));
        setIsAuthenticating(false);
      } catch (userErr) {
        try {
          const res = await axios.get(BASE_URL + "/companyProfile/view", {
            withCredentials: true,
          });
          dispatch(addCompany(res.data));
          setIsAuthenticating(false);
        } catch (companyErr) {
          console.error("Not logged in as user or company");
          setIsAuthenticating(false);
          // Avoid redirect loop on /gate and /login
          if (location.pathname !== "/gate" && location.pathname !== "/login") {
            navigate("/gate", { replace: true });
          }
        }
      }
    };

    if (!userData?._id && !companyData?._id) {
      fetchUserOrCompany();
    } else {
      setIsAuthenticating(false);
    }
  }, [dispatch, navigate, location.pathname, userData, companyData]);

  return (
    <div>
      <NavBar />
      <Outlet context={{ isAuthenticating }} />
      <Footer />

       <div className="fixed bottom-4 right-4 z-50">
        <Chat />
      </div>

    </div>
  );
};

export default Body;
