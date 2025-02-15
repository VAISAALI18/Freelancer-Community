const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json({ limit: "10mb" })); // Supports large Base64 uploads
app.use(cors());

// MongoDB Atlas Connection
const mongoURI = "mongodb+srv://rvaisaali677:Vaisaali%4018@skillhub.b9yfo.mongodb.net/SkillHub?retryWrites=true&w=majority";
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB Atlas Connected"))
.catch(err => console.log("MongoDB Connection Error:", err));

// Job Schema & Routes
const jobSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    companyLocation: { type: String, required: true },
    projectTitle: { type: String, required: true },
    jobTitle: { type: String, required: true },
    jobDescription: { type: String, required: true }
});

const Job = mongoose.model("Job", jobSchema);

app.post("/post-job", async (req, res) => {
    try {
        const job = new Job(req.body);
        await job.save();
        res.status(201).json({ message: "Job posted successfully!", job });
    } catch (error) {
        res.status(500).json({ error: "Error posting job", details: error.message });
    }
});

app.get("/search-job", async (req, res) => {
    try {
        const { title } = req.query;
        if (!title) return res.status(400).json({ error: "Job title is required" });
        const jobs = await Job.find({ jobTitle: { $regex: title, $options: "i" } });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: "Error searching for jobs", details: error.message });
    }
});

// Profile Schema & Routes
const profileSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 18, max: 100 },
    qualification: { type: String, required: true },
    technicalSkills: { type: [String], required: true },
    phoneNumber: { type: String, required: true, match: /^[0-9]{10}$/ },
    email: { type: String, required: true, unique: true, match: /\S+@\S+\.\S+/ },
    aadharCardNumber: { type: String, required: true, match: /^[0-9]{12}$/ },
    profileImage: { type: String, required: true }, // Base64 image
    resume: { type: String, required: true }, // Base64 PDF resume
});

const Profile = mongoose.model("Profile", profileSchema);

app.post("/create-profile", async (req, res) => {
    try {
        const { profileImage, resume } = req.body;
        if (!/^data:image\//.test(profileImage)) {
            return res.status(400).json({ error: "Invalid profile image format" });
        }
        if (!/^data:application\/pdf;/.test(resume)) {
            return res.status(400).json({ error: "Invalid resume format" });
        }
        const profile = new Profile(req.body);
        await profile.save();
        res.status(201).json({ message: "Profile created successfully!", profile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error creating profile", details: error.message });
    }
});

app.get('/get-profiles', async (req, res) => {
    try {
      const profiles = await Profile.find();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
