const validatorC = require("validator");

const validateSignUpDataCompany = (req) => {
    const { companyName, emailId, password, wasteType, pickupTime, photoUrl, about, price } = req.body;
    
    if (!companyName) {
        throw new Error("Company name is required.");
    }
    if (!emailId || !validatorC.isEmail(emailId)) {
        throw new Error("A valid email ID is required.");
    }
    if (!validatorC.isStrongPassword(password)) {
        throw new Error("Please enter a strong password.");
    }
    if (!wasteType) {
        throw new Error("Waste type is required.");
    }
    if (!photoUrl) {
        throw new Error("Photo URL is required.");
    }
    if (!pickupTime) {
        throw new Error("Pickup Time is required.");
    }
    if (!about) {
        throw new Error("About section is required.");
    }
    if (price === undefined || price === null) {
        throw new Error("Price is required.");
    }

    return true;
};

const validateEditProfileDataCompany = (req) => {
    const allowedEditFields = [
         "companyName",
         "photoUrl", 
         "wasteType",
         "emailId",
         "pickupTime",
         "location",
         "about", 
         "price",

    ];

   const isEditAllowed = Object.keys(req.body).every((field) => 
        allowedEditFields.includes(field)
);

if (!isEditAllowed) {
    throw new Error("Editing non-allowed fields is not permitted.");
}

return true;

};

module.exports = {
    validateSignUpDataCompany,
    validateEditProfileDataCompany,
}