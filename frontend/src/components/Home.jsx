import React from "react";
import { useSelector } from "react-redux";
// import PickupRequests from "./PickupRequests";
import CompanyFeed from "./companyFeed";
import Feed from "./Feed";

const Home = () => {
  const company = useSelector((store) => store.company);
  const isCompany = company?.role === "company";

  return isCompany ? <CompanyFeed /> : <Feed />;
};

export default Home;


