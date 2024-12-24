const express = require('express');
const app = express();
const path = require('path');
const Student = require('./Models/Student');
const connect = require('./Config/Connect');
const cors = require('cors');

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

// Start the server
app.listen(3000, () => {
    console.log("Server is up and running on port 3000");
});
