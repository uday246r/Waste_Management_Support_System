const mongoose = require('mongoose');
const validatorC = require('validator');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { JWT_SECRET } = require("../config/env");

const companySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
    },
    emailId: {
        type: String,
        required: [true,"Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validatorC.isEmail(value)){
                throw new Error("Invalid email address: " + value);
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength:4,
        // maxLength: 12,
        validate(value){
            if(!validatorC.isStrongPassword(value)){
                throw new Error("Enter strong password: " + value);
            }
        }
    },
    pickupTimeFrom: {
        type: String,
        required: true
      },
      pickupTimeTo: {
        type: String,
        required: true
      },
      
    wasteType: {
        type: String,
        enum: {
            values: ["Plastic", "Organic", "Metal"],
            message: `{VALUE} is not a valid waste type`,
        },
    },
    photoUrl: {
        type: String,
        default: "https://www.aquasafemine.com/wp-content/uploads/2018/06/dummy-man-570x570.png",
        validate(value){
            if(!validatorC.isURL(value)){
                throw new Error("Invalid Photo URL: " + value);
            }
        }
    },
    location: {
        type: String,
        default: "",
    },
    about: {
        type: String,
        default: "",
    },
    price:{
        type: Number,
    },
    // Payment account details for payouts
    paymentAccountNumber: {
        type: String,
    },
    paymentUpiId: {
        type: String,
    },
    paymentBankName: {
        type: String,
    },
    paymentIfscCode: {
        type: String,
    },
    razorpayAccountId: {
        type: String, // Razorpay account ID if using Razorpay Payouts
    },
},{
    timestamps: true,
});

companySchema.methods.getJWT = async function () {
    const company = this;

    const token = await  jwt.sign({ _id: company._id}, JWT_SECRET,{
        expiresIn: "7d",
    });
    return token;
}

companySchema.methods.validatePassword = async function (passwordInputByCompany) {
    const company = this;
    const passwordHash = company.password;

    const isPasswordValid = await bcrypt.compare(passwordInputByCompany, passwordHash);
    return isPasswordValid;
}

const Company = mongoose.model("Company", companySchema);

module.exports = Company;