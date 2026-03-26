const express = require('express');
const companyProfileRouter = express.Router();
const { companyAuth } = require("../middlewares/companyAuth");
const { validateEditProfileDataCompany } = require("../utils/validateCompany");

companyProfileRouter.get("/view", companyAuth, async(req,res) => {
    try{
        const company = req.company;
       
        res.send(company);
    } catch(err){
        res.status(400).send("ERROR : " + err.message);
    }
    });

    companyProfileRouter.patch("/edit", companyAuth, async (req,res) => {
       try{
        if(!validateEditProfileDataCompany(req)){
            throw new Error("Invalid Edit Request");
        }

        const loggedInCompany = req.company;
        
        Object.keys(req.body).forEach((key) => (loggedInCompany[key] = req.body[key]));
        
        await loggedInCompany.save();

        res.json({
            message: `${loggedInCompany.companyName}, your profile updated successfuly`,
            data: loggedInCompany,
       });

       } catch (err) {
        res.status(400).send("ERROR : " + err.message);
       }
    });

    module.exports = companyProfileRouter;
    