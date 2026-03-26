const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { JWT_SECRET } = require("../config/env");

const userAuth = async (req, res, next) => {
    try{
    // Read the token from the req cookies
    const {token} = req.cookies;
    if(!token){
        return res.status(401).send("Please Login!");
    }
    
    const decodedObj = await jwt.verify(token, JWT_SECRET);
    // console.log(decodedObj, token);
    const { _id } = decodedObj;
    
    const user = await User.findById(_id);
    
    if(!user) {
        console.log("USER NOT FOUND");
        throw new Error("User not found");
    }
    req.user = user;

    // console.log(req.user,user);
    next();
} catch(err){
    res.status(400).send("ERROR: " + err.message);
}

    //validate the token
    //Find the user
};

module.exports = {
    userAuth,
};