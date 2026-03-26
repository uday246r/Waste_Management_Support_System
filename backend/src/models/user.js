const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { JWT_SECRET } = require("../config/env");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase:true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)){
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
            if(!validator.isStrongPassword(value)){
                throw new Error("Enter strong password: " + value);
            }
        }
    },
    age: {
        type: Number,
        min: 18,    //for number use min and for string minLength
    },
    gender: {
        type: String,
        enum: {
            values: ["male", "female", "other"],
            message: `{VALUE} is not a valid gender type`,
        },
        // validate(value){
        //     if(!["male", "female", "others"].includes(value)){
        //         throw new Error("Gender data is not valid");
        //     }
        // },
    },
    photoUrl: {
        type: String,
        default: "https://www.aquasafemine.com/wp-content/uploads/2018/06/dummy-man-570x570.png",
        validate(value){
            if(!validator.isURL(value)){
                throw new Error("Invalid Photo URL: " + value);
            }
        }
    },
    about: {
        type: String,
        default: "This is a default about of the user!",
    },
    skills:{
        type: [String],
    },
    accountNumber: {
        type: String,
    },
    upiId: {
        type: String,
    },
},{
    timestamps: true,
});

// if we have to find user by first and last name then we will do below code to make our queries fast (concept of indexes - below we use compound indexing)
// User.find({ firstName: "Priyavadini", lastName: "Radhe"});
// userSchema.index({ firstName: 1, lastName: 1 });

// we can also create index for gender as :
// userSchema.index({ gender: 1 });

// If providing index make our query fast, as we can't provide them to all fields- the reason is that providing indexes unneccessary results in more cost.
//unique also provide index automaticaly and managed by mongoDB itself, but we can't use it in Name as it will not allow same name person

userSchema.methods.getJWT = async function () {
    const user = this;

    const token = await  jwt.sign({ _id: user._id}, JWT_SECRET,{
        expiresIn: "7d",
    });
    return token;
}

userSchema.methods.validatePassword = async function (passwordInputByUser) {
    const user = this;
    const passwordHash = user.password;

    const isPasswordValid = await bcrypt.compare(passwordInputByUser, passwordHash);
    return isPasswordValid;
}

const User = mongoose.model("User", userSchema);

module.exports = User;