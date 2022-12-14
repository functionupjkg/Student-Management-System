const userModel = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');




const { isValidEmail, isValidpassword, isValidName } = require('../validation/validation');

//=================================================[ Create User API ]================================================

const createUser = async function (req, res)  {
    try {

        const data = req.body;

        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: 'Please provide user data to registration' })
               
        if (!data.userName) return res.status(400).send({ status: false, message: "Name is manadatory" })
        
        if (!isValidName(data.userName)) return res.status(400).send({ status: false, message: "Please Enter Valid Name" })


        if (!data.email) return res.status(400).send({ status: false, message: "Email-Id is manadatory" })
        if (!isValidEmail(data.email)) return res.status(400).send({ status: false, message: "Please Enter Valid Email Id" })
        const existedEmail = await userModel.findOne({ email: data.email });
        if (existedEmail) {
            return res.status(400).send({ status: false, message: "Email is already registered" }); //checking is there any similar Email is present or not in DB
        }

        if (!data.password) return res.status(400).send({ status: false, message: "Password is manadatory" })
        if (!isValidpassword(data.password)) {
            return res.status(400).send({ status: false, message: "Please Enter Valid Password It should be length(8-15) character [Ex - Abcd1234]" })
        }

        const existUser = await userModel.findOne({ userName: data.userName });
        if (existUser) {
            return res.status(400).send({ status: false, message:  `${data.userName} is already registered, try another..   ` }); //checking is there any similar Email is present or not in DB
        }
        let hash = bcrypt.hashSync(data.password, 10)  // 10 is a saltrounds
        data.password = hash

        let createUser = await userModel.create(data)
        res.status(201).send({ status: true, message: "User Register Successfully", data: createUser })

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}



//================================================================ [ LOGIN API ] =====================================================

const userLogin = async function (req, res)  {
    try {
        let { email, password } = req.body;
        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: 'Credential are required for login' })
        if (!email) return res.status(400).send({ status: false, message: 'Email Id is mandatory' })
        if (!isValidEmail(email)) {
            return res.status(400).send({ status: false, message: "Email is Invalid" })
        }
        if (!password) return res.status(400).send({ status: false, message: 'Password is mandatory' })
        if (!isValidpassword(password)) {
            return res.status(400).send({ status: false, message: "Password Should be Min-8 & Max-15, it contain atleast -> 1 Uppercase , 1 Lowercase , 1 Number , 1 Special Character  Ex- Abcd@123" })
        }

        const user = await userModel.findOne({ email: email, isDeleted: false })
        // console.log(user)
        if (!user) {
            return res.status(400).send({ status: false, message: "Please provide correct email" })
        }

        const isMatch = await bcrypt.compare(password, user.password) // compare logIN and DB password , return boolean value
        if (!isMatch) { return res.status(400).send({ Status: false, message: "Invalid credential" }) }

        const token = jwt.sign({ user: user._id.toString(), email : email, expiresIn: "24h" },
            "Jyoti-UI-Project"
        )

        return res.status(200).send({ status: true, message: "User Login successfully", data: { user: user._id, token: token } })

    }
    catch (err) {
        return res.status(500).send({ message: "server error", error: err.message })
    }

}




//=========================== [ Exported Modules ]===========================

module.exports = { createUser, userLogin };