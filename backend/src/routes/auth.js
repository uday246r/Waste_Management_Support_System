const express = require("express");
const authRouter = express.Router();
const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { NODE_ENV } = require("../config/env");

const isProduction = NODE_ENV === "production";
const baseCookieOptions = {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    path: "/",
};

 



 authRouter.post("/signup", async (req, res) => {
     try{
        // validation of data
     validateSignUpData(req);
     //Encrypt the password
 
     const { firstName, lastName, emailId, password} = req.body;
     const passwordHash = await bcrypt.hash(password, 10);
    //  console.log(passwordHash);
 // Creating a new instance of the User model
     const user = new User({
         firstName,
         lastName,
         emailId,
         password: passwordHash,
     });
 
     const savedUser = await user.save();
     const token = await savedUser.getJWT();

    res.cookie("token", token, {
       ...baseCookieOptions,
       expires: new Date(Date.now() + 8 * 3600000),
    });
     
     res.json({ message: "User added sucessfully", data: savedUser });
     } catch(err) {
         res.status(400).send("ERROR :  " + err.message);
     }
 });

 authRouter.post("/login", async(req,res) => {
    try{
        const { emailId, password } = req.body;

        const user = await User.findOne({ emailId: emailId });
        if(!user) {
            throw new Error("Invalid credentials");
        }
        const isPasswordValid = await user.validatePassword(password);

        if(isPasswordValid){

            // create a JWT Token

            const token = await user.getJWT();
            // console.log(token);

            //Add the token to cookie and send the response back to the user
            res.cookie("token",token, {
                ...baseCookieOptions,
                expires: new Date(Date.now() + 8 * 36000000),
            });
            res.send(user);
        } else{
            throw new Error("Invalid credentials");
        }

    } catch (err){
        res.status(400).send("Error : " + err.message);
    }
})

authRouter.post("/logout", async (req,res) => {
    res.cookie("token",null,{
        ...baseCookieOptions,
        expires: new Date(Date.now()),
    });
    res.send("Logout Successful!!");
});


 module.exports = authRouter;