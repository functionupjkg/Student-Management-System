const mongoose = require('mongoose')

//<<----------------Validation for ObjectId check in DB ---------------->>
const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
};


//<<----------------Validation for string ---------------->>
const isValid = function (value) {
    return (/^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/).test(value)
}


//<<----------------Validation for Email ---------------->>  
const isValidEmail = function (email) {
    return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).test(email);
}

//<<----------------Validation for password ---------------->>  
const isValidpassword = function (pass) {
    return (/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,15}$/).test(pass);
}

//<<----------------Validation for Marks ---------------->>
const isValidMark = function (price) {
    return /^(?=.*[1-9])\d*(?:\.\d{1,2})?$/.test(price);
  };

const isValidNo = function (value) {
    if (typeof value == "undefined" || value == null || typeof value === "boolean" || typeof value === "number") return false
    if (typeof value == "string" && value.trim().length == 0) return false
    return true
}

const isValidFid = (value) => {
    if (typeof value === "undefined" || value === null || typeof value === "boolean") return false;
    if (value.length === 0) return false;
    return true;
};

const isValidName = function (value) {
    if (typeof value == "undefined" || value == null || typeof value === "boolean") return false
    if (typeof value === "number" && value.trim().length == 0) return false
    return true
}


module.exports = {
    isValidObjectId,
    isValid,
    isValidEmail,
    isValidpassword,
    isValidNo,
    isValidFid,
    isValidName,
    isValidMark

}
