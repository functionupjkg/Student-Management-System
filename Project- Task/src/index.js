const express = require('express')
const {default : mongoose} = require('mongoose')
const app = express();
const bodyParser = require('body-parser')
const route = require('./routes/route')
mongoose.set('strictQuery', true);


app.use(bodyParser.json())




mongoose.connect("mongodb+srv://Jyoti273-db:djukOqR9QbI5Itvc@cluster0.nzuylps.mongodb.net/student_Zone", {
    useNewUrlParser: true,
})
.then(() => console.log('MongoDB is Conected'))
.catch((err) => console.log(err));





app.use("/", route);

app.listen(3000, () => {
    console.log("App running on Port 3000")
})