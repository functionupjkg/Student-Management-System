const express = require('express')
const router = express.Router();
const {authenticate, authorise} = require ('../middleware/auth')
const userController = require('../controller/userController');
const studentController = require('../controller/studentController');



router.post('/user-create', userController.createUser)
router.post('/login', userController.userLogin)
router.post ('/student', authenticate , authorise,  studentController.createStudent)
router.get('/students', studentController.getStudent)
router.get('/student/:studentId', studentController.getAll)
router.put('/student/:studentId', authenticate , authorise, studentController.updateStudent)
router.delete('/student/:studentId', authenticate , authorise, studentController.deleteByParams)
router.delete('/student/', studentController.deleteByQuery)



//API for wrong route-of-API
router.all("/*", function (req, res) {
    res.status(400).send({status: false, message: "Path Not Found" })
})  

module.exports = router;

