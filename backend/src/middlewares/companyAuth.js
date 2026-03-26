const jwt = require("jsonwebtoken");
const Company = require("../models/company");
const { JWT_SECRET } = require("../config/env");

const companyAuth = async (req, res, next) => {
    try{
    // Read the token from the req cookies
    const {token} = req.cookies;
    if(!token){
        return res.status(401).send("Please Login!");
    }

    const decodedObj = await jwt.verify(token, JWT_SECRET);

    const { _id } = decodedObj;

    const company = await Company.findById(_id);
    console.log(decodedObj, _id, company);
    if(!company) {
        throw new Error("Company not found");
    }
    req.company = company;
    next();
} catch(err){
    res.status(400).send("ERROR: " + err.message);
}

    //validate the token
    //Find the company
};

module.exports = {
    companyAuth,
};