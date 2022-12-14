const jwt = require("jsonwebtoken");
const userModel = require("../model/userModel")
const studentModel = require("../model/studentModel")


//======================================= [Authencation] =====================================

const authenticate = async function (req, res, next) {

    try {
        let token = req.headers["authorization"]

        if (!token) {
            return res.status(404).send({ status: false, msg: "token must be present" });
        }
        token = token.slice(7) // bearer Token = Token 
        jwt.verify(token, "Jyoti-UI-Project", (err, decodedToken) => {

            if (err) {
                let message = err.message = "jwt expiry" ? "token is expired , please login again" : "invalid token"
                return res.status(401).send({ status: false, message: message })
            }
            req.loggedInUser = decodedToken;
            // console.log(decodedToken);

            next()
        });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};




///=========================================== [Authorisation] =====================================================

const authorise = async function (req, res, next) {
    try {

        let userId = req.loggedInUser.user
        let data = req.body
        
        let userData = await userModel.findOne({ _id: userId, isDeleted: false });
        // console.log(userData)
        if (!userData)
            return res.status(404).send({ status: false, messagae: "No Such User Available." })

        if (data.name && data.subject) {
            let studentData = await studentModel.findOne({ name: data.name, subject: data.subject, isDeleted: false })
            // console.log(studentData)
            if (studentData) {
                if (data.name == studentData.name && data.subject == studentData.subject) {
                    if (userData._id.toString() !== studentData.userId.toString())
                        return res.status(403).send({ status: false, messagae: "Unauthorized User, You can't edit / delelte to ohters student marks" })
                }
            }
            next();
        }


        next();


    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}


module.exports = { authenticate, authorise }