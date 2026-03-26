const express = require("express");
const authCRouter = express.Router();
const { validateSignUpDataCompany } = require("../utils/validateCompany");
const Company = require("../models/company");
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

authCRouter.post("/signup", async (req, res) => {
    try {
        // Validate signup data
        validateSignUpDataCompany(req);

        let {
            companyName,
            emailId,
            password,
            wasteType,
            photoUrl,
            location,
            about,
            price,
            pickupTimeFrom,
            pickupTimeTo,
            pickupTime, // in case frontend sends this as a fallback
        } = req.body;

        // Fallback support: split pickupTime if pickupTimeFrom/To not provided
        if ((!pickupTimeFrom || !pickupTimeTo) && pickupTime) {
            const parts = pickupTime.split(" - ");
            pickupTimeFrom = parts[0];
            pickupTimeTo = parts[1];
        }

        if (!pickupTimeFrom || !pickupTimeTo) {
            throw new Error("pickupTimeFrom and pickupTimeTo are required");
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const company = new Company({
            companyName,
            emailId,
            password: passwordHash,
            wasteType,
            pickupTimeFrom,
            pickupTimeTo,
            photoUrl,
            location,
            about,
            price,
        });

        const savedCompany = await company.save();
        const token = await savedCompany.getJWT();

        res.cookie("token", token, {
            ...baseCookieOptions,
            expires: new Date(Date.now() + 8 * 3600000),
        });

        res.json({ message: "Company added successfully", data: savedCompany });
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

authCRouter.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;

        const company = await Company.findOne({ emailId });
        if (!company) throw new Error("Invalid credentials");

        const isPasswordValid = await company.validatePassword(password);
        if (!isPasswordValid) throw new Error("Invalid credentials");

        const token = await company.getJWT();

        res.cookie("token", token, {
            ...baseCookieOptions,
            expires: new Date(Date.now() + 8 * 36000000),
        });

        res.send(company);
    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});

authCRouter.post("/logout", async (req, res) => {
    res.cookie("token", null, {
        ...baseCookieOptions,
        expires: new Date(Date.now()),
    });
    res.send("Logout Successful!!");
});

module.exports = authCRouter;
