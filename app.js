const express = require('express');
const app = express();
const path = require('path');
const Student = require('./Models/Student');
const connect = require('./Config/Connect');
connect();
const cors = require('cors');
const Student = require('./Models/Student');
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.post("/createStudent", async(req,res)=>{
    try {
        const {name , age  }= req.body;
        const newStudent = await Student.create({
            name,
            age,
        });
        return res.status(200).send({
            newStudent
        });
    } catch (error) {
        return res.status(404).json({
            Message:"Something went wrong",
            error: error.message
        });
        
    }




});
app,get("/findStudent/:name" , (req,res)=>{
    try {
        const Student = Student.findOne({name:req.para.name});
    res.status(200).send(Student);
        
    } catch (error) {
        res.status(404).json({message:"Something Went Wrong",
            error:error.message
        });
        
    }
    
})
app.post("/updateStudent/:id" , async(req,res)=>{
    try {
        const {
            strengths,weaknesses, interests , preferences 
        } = req.body;
        const updatedStudent = await Student.findOneAndUpdate({_id:req.params.id},
            {
                strengths:strengths.split(','),
                preferences:preferences.split(','),
                interests:interests.split(','),
                weaknesses:weaknesses.split(',')
    
            },
            {new:true , upsert:true}
        );
        res.status(200).send(updatedStudent);
        
    } catch (error) {
        res.status(404).json({
            message:"SOmething Went Wrong ",
            error:error.message,
        });
        
    }
    

});


app.listen(3000, ()=>{
    console.log("Server Up and Running ");
});