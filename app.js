const express = require('express');
const app = express();
const path = require('path');
const Student = require('./Models/Student');
const connect = require('./Config/Connect');
const cors = require('cors');
const WorkShop = require('./Models/WorkShop');

// Connect to the database
connect();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Route to create a student
app.post("/createStudent", async (req, res) => {
    try {
        const { name, age } = req.body;
        const existingStudent = await Student.findOne({ name });
        if (existingStudent) {
            return res.status(200).send({
                message: "Student already exists",
                student: existingStudent,
            });
        }
        const newStudent = await Student.create({
            name,
            age,
        });

        return res.status(200).send({
            newStudent
        });
    } catch (error) {
        return res.status(404).json({
            message: "Something went wrong",
            error: error.message
        });
    }
});


// Route to find a student by name
app.get("/findStudent/:name", async (req, res) => {
    try {
        const foundStudent = await Student.findOne({ name: req.params.name });
        if (!foundStudent) {
            return res.status(404).send({ message: "Student not found" });
        }
        res.status(200).send(foundStudent);
    } catch (error) {
        res.status(404).json({
            message: "Something went wrong",
            error: error.message
        });
    }
});

// Route to update a student
app.post("/updateStudent/:id", async (req, res) => {
    try {
        const { strengths, weaknesses, interests, preferences } = req.body;
        const updatedStudent = await Student.findOneAndUpdate(
            { _id: req.params.id },
            {
                strengths: strengths.split(','),
                weaknesses: weaknesses.split(','),
                interests: interests.split(','),
                preferences: preferences.split(',')
            },
            { new: true, upsert: true }
        );
        res.status(200).send(updatedStudent);
    } catch (error) {
        res.status(404).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
});

// Route to create WorkShops 
app.post('/createWorkShop' , async(req,res)=>{
    try {
        const {name , desc , image , preferences ,price} = req.body;
        const newWorkShop = await WorkShop.create({
            name,
            preferences:preferences.split(','),
            image,
            price,
            desc
        });

        res.status(200).send(newWorkShop);
        
    } catch (error) {
        res.status(404).json({
            message:"Something went wrong",
            error:error.message,
        })
        
    }

});

// Recommendation Logic Api

app.get('/students/:userId/recommendedWorkshops' , async(req,res)=>{
    try {
        const student = await Student.findById(req.params.userId);
        if(!student){
            return res.status(404).send("No Student Exists");
        }

        const workshops = await WorkShop.find();
        console.log(workshops);
        const recommendedWorkshops = workshops.filter(workshop => {
            return workshop.preferences.some(preference => student.preferences.includes(preference));
        });
        res.json({recommendedWorkshops});
        
    } catch (error) {
        res.status(500).json({message:"Something went wrong " ,
            error:error.message
        });
        
    }
});

app.post('/registerWorkshop', async (req, res) => {
    try {
        const { workshopId, userId } = req.body;
        const workshop = await WorkShop.findById(workshopId);
        if (!workshop) {
            return res.status(404).json({ message: 'Workshop not found' });
        }
        if (workshop.students.includes(userId)) {
            return res.status(400).json({ message: 'Student already registered for this workshop' });
        }

        workshop.students.push(userId);
        await workshop.save();

        res.status(200).json({ message: 'Successfully Registered', workshop });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
});


// Start the server
app.listen(3000, () => {
    console.log("Server is up and running on port 3000");
});
