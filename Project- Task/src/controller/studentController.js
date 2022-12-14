const studentModel = require('../model/studentModel');
const userModel = require('../model/userModel');

const { isValid, isValidMark, isValidObjectId } = require('../validation/validation');


//================================================== [ Create Student API ]================================================

const createStudent = async function (req, res) {
    try {

        let data = req.body;

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: 'Student data is required for data creation' });
        }
        if (!data.name) {
            return res.status(400).send({ status: false, message: 'Student name is required' });
        }
        if (!isValid(data.name)) {
            return res.status(400).send({ status: false, message: 'Student name is not valid' });
        }
        if (!data.subject) {
            return res.status(400).send({ status: false, message: 'Subject is required' });
        }
        if (!['Math', 'Physics', 'Chemistry', 'Hindi', 'English', 'Sanskrit', 'Sociology', 'Psychology'].includes(data.subject)) {
            return res.status(400).send({ status: false, messagae: "Subject must be ['Math', 'Physics', 'Chemistry', 'Hindi', 'English', 'Sanskrit','Sociology', 'Psychology' ]" })
        }
        if (!data.marks) {
            return res.status(400).send({ status: false, message: 'Student Marks is required' });
        }
        if (!isValidMark(data.marks)) {
            return res.status(400).send({ status: false, message: 'Student marks should be Integer' });
        }


        // console.log(data.name, data.subject)
        if (data.name && data.subject) {
            let existData = await studentModel.findOne({ name: data.name, subject: data.subject, isDeleted: false })
            // console.log(existData)
            if (existData) {

                if (existData.name == data.name && existData.subject == data.subject) {
                    data.marks = existData.marks + data.marks
                    // console.log(data.marks)
                    let updateMarks = await studentModel.findByIdAndUpdate({ _id: existData._id.toString() }, { $set: { marks: data.marks } }, { new: true })
                    return res.status(200).send({ status: true, message: "Student Marks updated successfully", data: updateMarks });
                }
            }
            else {
                // console.log(data)

                data.userId = req.loggedInUser.user
                const studentData = await studentModel.create(data)

                return res.status(201).send({ status: true, message: 'Student data created successfully', data: studentData })
            }
        }

    }

    catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}


//=================================================== [ GET API WITH FILTER] ================================================

const getStudent = async function (req, res) {

    try {

        const studentDetail = { isDeleted: false }  // {isDeleted : false , name : substring ,subject : [] , marks : {$gt : 50 , $lt : 100}}.sort(marks : 1 || - 1)
        const sorting = {}

        let { studentId, userId, name, subject, marksGreaterThan, marksLessThan, marksSort } = req.query

        if (studentId) {
            if (!isValidObjectId(studentId)) return res.status(400).send({ status: false, message: 'Invalid studentId' })
            if (studentId) {
                if (Object.keys(req.query).length == 1) {
                    let studentData = await studentModel.findOne({ _id: studentId, isDeleted: false })

                    return res.status(200).send({ status: true, message: studentData })
                }
            }
            studentDetail.studentId = studentId
        }

        if (userId) {
            if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: 'Invalid userId' })
            if (userId && studentId) {
                let userData = await studentModel.findOne({ userId: userId, _id: studentId, isDeleted: false })
                return res.status(200).send({ status: true, message: userData })
            }
            studentDetail.userId = userId;
        }

        if (name || typeof name == "string") {

            if (!isValid(name)) { return res.status(400).send({ status: false, message: "Plz provide valid name" }) }

            studentDetail.name = { $regex: name, $options: "i" }

        }

        if (subject || typeof subject == "string") {

            if (!['Math', 'Physics', 'Chemistry', 'Hindi', 'English', 'Sanskrit', 'Sociology', 'Psychology'].includes(subject)) {
                return res.status(400).send({ status: false, message: "Please Provide one of the given ['Math', 'Physics', 'Chemistry', 'Hindi', 'English', 'Sanskrit','Sociology', 'Psychology' ]" })
            }
            studentDetail.subject = subject
        }

        if (marksGreaterThan || typeof marksGreaterThan == "string") {
            if (!/^(\d*\.)?\d+$/.test(marksGreaterThan)) { return res.status(400).send({ status: false, message: "provide valid marks to filter" }) }
            studentDetail.marks = { $gt: Number(marksGreaterThan) } // findOne({price :{$gt : 100}})
        }
        if (marksLessThan || typeof marksLessThan == "string") {
            if (!/^(\d*\.)?\d+$/.test(marksLessThan)) { return res.status(400).send({ status: false, message: "provide valid marks for filter" }) }
            if (!studentDetail.marks) {
                studentDetail.marks = { $lt: Number(marksLessThan) } //findOne({price :{$lt : 100}})
            }
            studentDetail.marks.$lt = Number(marksLessThan)  // findOne({price :{$gt : 100 , $lt : 500}})

        }
        if (marksSort || typeof marksSort == "string") {
            if (marksSort != 1 && marksSort != -1) { return res.status(400).send({ status: false, message: "the value should be 1 or -1" }) }
            sorting.marks = Number(marksSort)
        }

        const studentGet = await studentModel.find(studentDetail).sort(sorting)

        if (studentGet.length == 0) {
            return res.status(404).send({ status: false, message: "No Such Student found" })
        }

        return res.status(200).send({ status: true, data: studentGet })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}




//=================================================== [ GET API ] ================================================

const getAll = async function (req, res) {

    try {
        let studentId = req.params.studentId

        if (!studentId) return res.status(400).send({ status: false, message: "No parameter found" })
        if (!isValidObjectId(studentId)) return res.status(400).send({ status: false, message: "Invalid StudentId" })

        const findStuId = await studentModel.findOne({ _id: studentId, isDeleted: false })
        if (!findStuId) return res.status(404).send({ staus: false, message: "No such student exist with this Id" })

        return res.status(200).send({ status: true, message: "success", data: findStuId })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


//=================================================== [ UPDATE API ] ================================================



const updateStudent = async function (req, res) {

    try {

        const studentId = req.params.studentId
        const userId = req.loggedInUser.user
        console.log(req.loggedInUser)

        if (!studentId) {
            return res.status(400).send({ status: false, message: "No parameter found,please provide Id" })
        }
        if (!isValidObjectId(studentId)) { return res.status(400).send({ status: false, message: "Invalid studentId" }) }

        const studentExist = await studentModel.findOne({ _id: studentId, isDeleted: false })

        if (!studentExist) {
            return res.status(404).send({ status: false, message: "No Student Found" })
        }

        if (studentExist.userId.toString() !== userId) {
            return res.status(401).send({ status: false, message: "You are not authorized to update this student" })
        }

        let data = req.body
        let { name, subject, marks } = data

        if ((Object.keys(data).length == 0)) { return res.status(400).send({ status: false, message: "No data for updation , plz provide data" }) }


        let updateStudent = { isDeleted: false }
        if (name) {
            if (!isValid(name)) {
                return res.status(400).send({ status: false, message: 'Please Enter Valid Name' })
            }
            if (studentExist.name == name) {
                return res.status(400).send({ status: false, message: "Name already exists" })
            }
            updateStudent.name = name;
        }
        if (subject) {
            if (!isValid(subject)) {
                return res.status(400).send({ status: false, message: 'Please Enter Valid subject' })
            }
            if (studentExist.subject == subject) {
                return res.status(400).send({ status: false, message: "Subject already exists" })
            }
            updateStudent.subject = subject;
        }
        if (marks) {
            if (!isValidMark(marks)) {
                return res.status(400).send({ status: false, message: 'Please Enter Valid marks' })
            }
            if (studentExist.marks == marks) {
                return res.status(400).send({ status: false, message: "Marks already exists" })
            }
            updateStudent.marks = marks;
        }

        const dataUpadate = await studentModel.findOneAndUpdate({ _id: studentId }, { $set: updateStudent }, { new: true })

        return res.status(200).send({ status: true, message: "Student details updated successfully ", data: dataUpadate })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


//================================ [ Delete student by Path Params ] =====================================

const deleteByParams = async function (req, res) {
    try {
        let id = req.params.studentId;
        let userId = req.loggedInUser.user

        if (!isValidObjectId(id)) {
            return res.status(400).send({ status: false, message: 'Invalid StudentId' });
        }

        const studentData = await studentModel.findOne({ _id: id });
        if (userId != studentData.userId.toString()) {
            return res.status(401).send({ status: false, message: "You are not authorized to delete this student" });
        }
        console.log(studentData)
        if (!studentData) {
            return res.status(404).send({ status: false, messagae: "This Student is not found or deleted." });
        }
        if (studentData.isDeleted == true) {
            return res.status(404).send({ status: false, messagae: "This Student is already deleted." });
        }

        studentData.isDeleted = true;

        const updated = await studentModel.findByIdAndUpdate({ _id: id }, studentData, { new: true });
        return res.status(200).send({ status: true, messagae: " Student Deleted Successfully" });

    } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
};



//================================ [ Delete Student By Query Params ] =========================================

const deleteByQuery = async function (req, res) {
    try {
        if (Object.keys(req.query).length == 0) return res.status(400).send({ status: false, messagae: "Send atleast one Query for delete student " })

        const studentDetail = { isDeleted: false }


        let { studentId, userId, name, subject, marksGreaterThan, marksLessThan } = req.query

        if (studentId) {
            if (!isValidObjectId(studentId)) return res.status(400).send({ status: false, message: 'Invalid studentId' })
            studentDetail.studentId = studentId
        }

        if (userId) {
            if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: 'Invalid userId' })
            studentDetail.userId = userId;
        }

        if (userId && studentId) {
            let userData = await studentModel.findOne({ userId: userId, _id: studentId, isDeleted: false })
            if (!userData) return res.status(404).send({ status: false, message: "No Such Student Found" })

            if (userData.userId.toString() != userId) {
                return res.status(404).send({ status: false, message: "No Such Student Data Fount" })
            }
            studentDetail.userId = userId
        }

        if (name || typeof name == "string") {
            if (!isValid(name)) { return res.status(400).send({ status: false, message: "Plz provide valid name" }) }
            studentDetail.name = { $regex: name, $options: "i" }

        }

        if (subject || typeof subject == "string") {

            if (!['Math', 'Physics', 'Chemistry', 'Hindi', 'English', 'Sanskrit', 'Sociology', 'Psychology'].includes(subject)) {
                return res.status(404).send({ status: false, message: "No Such Student Found' ]" })
            }
            studentDetail.subject = subject
        }

        if (marksGreaterThan || typeof marksGreaterThan == "string") {
            if (!/^(\d*\.)?\d+$/.test(marksGreaterThan)) { return res.status(400).send({ status: false, message: "provide valid marks to filter" }) }
            studentDetail.marks = { $gt: Number(marksGreaterThan) } // findOne({price :{$gt : 100}})
        }
        if (marksLessThan || typeof marksLessThan == "string") {
            if (!/^(\d*\.)?\d+$/.test(marksLessThan)) { return res.status(400).send({ status: false, message: "provide valid marks for filter" }) }
            if (!studentDetail.marks) {
                studentDetail.marks = { $lt: Number(marksLessThan) } //findOne({price :{$lt : 100}})
            }
            studentDetail.marks.$lt = Number(marksLessThan)  // findOne({price :{$gt : 100 , $lt : 500}})

        }

        const deleteData = await studentModel.updateMany(studentDetail, { $set: { isDeleted: true } }, { new: true })
        console.log(deleteData)
        if (deleteData.modifiedCount == 0) {
            return res.status(404).send({ status: false, messagae: "Such Student Data not found" })
        }
        return res.status(200).send({ status: true, messagae: "Student Deleted Successfully" })
    }

    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, messagae: err.message })
    }
}


//=========================================== [ Exported Module ] ==============================================

module.exports = { createStudent, getAll, getStudent, updateStudent, deleteByParams, deleteByQuery };