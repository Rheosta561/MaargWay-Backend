const express = require('express');
require('dotenv').config();
const app = express();
const path = require('path');
const Student = require('./Models/Student');
const connect = require('./Config/Connect');
const cors = require('cors');
const WorkShop = require('./Models/WorkShop');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Connect to the database
connect();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname , 'public')));

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
// route to delete Students
// app.get('/deleteusers',async(req,res)=>{
//     try {
//         const result = await Student.deleteMany({}); 
    
//         res.status(200).json({ 
//           message: `Deleted ${result.deletedCount} students`, 
//           result 
//         });
//       } catch (error) {
//         console.error(error);
//         res.status(500).json({ 
//           message: 'Error deleting students', 
//           error 
//         });
//       }

// })


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



// AI based Recommendation API 
app.get('/AiRecommendation/:userid', async (req, res) => {
    try {
        const aiuser = await Student.findById(req.params.userid);
        if (!aiuser) {
            return res.status(404).json({ message: 'User not found' });
        }
        const strengths = aiuser.strengths.join(' ');
        const weaknesses = aiuser.weaknesses.join(' ');
        const interests = aiuser.interests.join(' ');

        // Prompt to get heading 
        const headingPrompt = `
            Suggest a single heading for a mental health exercise based on the user's strengths: ${strengths}, weaknesses: ${weaknesses}, and interests: ${interests}. 
    Focus on making it engaging and specific to the user, with an emphasis on their strengths, weaknesses, and interests. Please provide only one heading in not more than 5 words that fits this description.
        `;
        const genAI = new GoogleGenerativeAI(process.env.API);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const headingResult = await model.generateContent(headingPrompt);
        const headingText = await headingResult.response.text();

        // prompt to get hte description
        const descPrompt = `
            Based on the following strengths: ${strengths}, weaknesses: ${weaknesses}, and interests: ${interests}, 
            suggest a mental health exercise in 100-150 words. Focus on a personalized exercise that addresses the strengths, weaknesses, and interests of the user.
        `;
        const descResult = await model.generateContent(descPrompt);
        const descText = await descResult.response.text();

        res.status(200).json({
            heading: headingText.trim(),  
            desc: descText.trim()         
        });

    } catch (error) {
        console.error('Error generating AI recommendation:', error);
        res.status(500).json({
            message: "Something went wrong while generating the recommendation",
            error: error.message
        });
    }
});

app.get('/' ,async(req,res)=>{
    try {
        const workshops = await WorkShop.find();
        const workshopNames = workshops.map(workshop => workshop.name);
        const studentCounts = workshops.map(workshop => workshop.students.length);
        res.render('chart', {
            workshops
        });
    } catch(error){
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// setting postive responses 
app.put('/:workshopid/response/positive' , async(req,res)=>{
    try {
        // const {positive , negative}=req.body;
    const updatedworkshop = await WorkShop.findOneAndUpdate({_id:req.params.workshopid},{
        $inc: { positive: 1 } 
    },{new:true , upsert:true});
    res.status(200).json({
        message:"success",
        data:updatedworkshop
    });
        
    } catch (error) {
        res.status(404).json({
            message:"Something went wrong",
            error:error.message
        });
        
    }
  

});
app.put('/:workshopid/response/negative' , async(req,res)=>{
    try {
        // const {positive , negative}=req.body;
    const updatedworkshop = await WorkShop.findOneAndUpdate({_id:req.params.workshopid},{
        $inc: { negative: 1 } 
    },{new:true , upsert:true});
    res.status(200).json({
        message:"success",
        data:updatedworkshop
    });
        
    } catch (error) {
        res.status(404).json({
            message:"Something went wrong",
            error:error.message
        });
        
    }
  

});


// Start the server
app.listen(3000, () => {
    console.log("Server is up and running on port 3000");
});
