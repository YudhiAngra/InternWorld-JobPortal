//local matching
// const express = require("express");
// const router = express.Router();
// const fs = require("fs");
// const path = require("path");
// const pdfParse = require("pdf-parse");

// const User = require("../models/user");
// const Job = require("../models/job");

// router.get("/recommendations", async (req, res) => {
//   try {
//     const sessionUser = req.session.user;
//     if (!sessionUser) return res.status(401).json({ error: "Unauthorized" });

//     const user = await User.findById(sessionUser.id);
//     if (!user) return res.status(404).json({ error: "User not found" });

//     // 1. Get User Skills
//     const userSkills = user.skills?.map(s => s.toLowerCase()) || [];
//     console.log("User Skills:", userSkills);

//     // 2. Optionally read resume (for logging purposes)
//     if (user.resumeUrl) {
//       try {
//         const resumePath = path.join(__dirname, "../public", user.resumeUrl);
//         if (fs.existsSync(resumePath)) {
//           const dataBuffer = fs.readFileSync(resumePath);
//           const data = await pdfParse(dataBuffer);
//           console.log("Resume parsed successfully, length:", data.text.length);
//         }
//       } catch (err) {
//         console.error("Error parsing resume:", err);
//       }
//     }

//     // 3. Fetch all jobs
//     const jobs = await Job.find({}).lean();
//     if (!jobs || jobs.length === 0) {
//       return res.json([]);
//     }

//     // 4. Score each job based on skill match
//     const scored = jobs.map(job => {
//       const techStack = job.technologyStack.map(t => t.toLowerCase());
//       const matchedSkills = userSkills.filter(skill => techStack.includes(skill));
//       const score = matchedSkills.length;

//       return {
//         ...job,
//         score,
//         matchReason:
//           score > 0
//             ? `Matches ${score} of your skill${score > 1 ? "s" : ""}: ${matchedSkills.join(", ")}. Required stack: ${job.technologyStack.join(", ")}.`
//             : `No direct skill match. Required stack: ${job.technologyStack.join(", ")}.`,
//       };
//     });

//     // 5. Filter only jobs with at least 1 match, sort by score, return top 3
//     const recommendedJobs = scored
//       .filter(job => job.score > 0)
//       .sort((a, b) => b.score - a.score)
//       .slice(0, 3);

//     console.log(`Found ${recommendedJobs.length} recommended jobs for user`);

//     return res.json(recommendedJobs);

//   } catch (error) {
//     console.error("AI Recommendation Error:", error);
//     res.status(500).json({ error: "Failed to generate recommendations" });
//   }
// });

// module.exports = router;


// const express = require("express");
// const router = express.Router();
// const fs = require("fs");
// const path = require("path");
// const pdfParse = require("pdf-parse");
// const Groq = require("groq-sdk");

// const User = require("../models/user");
// const Job = require("../models/job");

// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// router.get("/recommendations", async (req, res) => {
//   try {
//     const sessionUser = req.session.user;
//     if (!sessionUser) return res.status(401).json({ error: "Unauthorized" });

//     const user = await User.findById(sessionUser.id);
//     if (!user) return res.status(404).json({ error: "User not found" });

//     // 1. Get User Profile Text (Skills + Resume)
//     let profileText = `Skills: ${user.skills ? user.skills.join(", ") : "None specified"}.\n`;
//     console.log("User Skills:", user.skills);

//     if (user.resumeUrl) {
//       try {
//         const resumePath = path.join(__dirname, "../public", user.resumeUrl);
//         if (fs.existsSync(resumePath)) {
//           const dataBuffer = fs.readFileSync(resumePath);
//           const data = await pdfParse(dataBuffer);
//           profileText += `\nResume Content:\n${data.text}`;
//           console.log("Resume parsed successfully");
//         }
//       } catch (err) {
//         console.error("Error parsing resume:", err);
//       }
//     }

//     // 2. Fetch all jobs
//     const jobs = await Job.find({}).lean();
//     if (!jobs || jobs.length === 0) {
//       return res.json([]);
//     }

//     // 3. Check if Groq API key exists
//     if (!process.env.GROQ_API_KEY) {
//       console.warn("No GROQ_API_KEY found. Using skill-matching fallback.");
//       return skillMatchFallback(user, jobs, res);
//     }

//     // 4. Prepare jobs text for Groq
//     const jobsText = jobs
//       .map(
//         (j) =>
//           `ID: ${j._id} | Title: ${j.title} | Company: ${j.company} | Tech: ${j.technologyStack.join(", ")} | Requirements: ${j.requirements}`
//       )
//       .join("\n");

//     // 5. Ask Groq to match
//     const prompt = `
// You are an expert technical recruiter. I will provide a candidate's profile and a list of available jobs.
// Based on the candidate's skills and resume content, identify the top 3 best matching jobs.

// Candidate Profile:
// ${profileText.substring(0, 2000)}

// Available Jobs:
// ${jobsText}

// Respond ONLY with a valid JSON array. No explanation, no markdown, no extra text.
// Each object must have exactly two fields:
// - "jobId": the exact ID string from the list
// - "matchReason": a short 1-2 sentence explanation of why this is a good fit

// Example format:
// [{"jobId":"abc123","matchReason":"Strong match due to React and Node.js skills."},{"jobId":"def456","matchReason":"Java experience aligns with backend requirements."}]
//     `;

//     try {
//       const completion = await groq.chat.completions.create({
//         model: "llama3-8b-8192",
//         messages: [{ role: "user", content: prompt }],
//         temperature: 0.3,
//         max_tokens: 1000,
//       });

//       let responseText = completion.choices[0]?.message?.content || "[]";

//       // Clean up markdown if present
//       responseText = responseText
//         .replace(/```json/g, "")
//         .replace(/```/g, "")
//         .trim();

//       console.log("Groq response:", responseText);

//       const matches = JSON.parse(responseText);

//       // 6. Map back to full job objects
//       const recommendedJobs = matches
//         .map((match) => {
//           const job = jobs.find((j) => j._id.toString() === match.jobId);
//           if (job) {
//             return { ...job, matchReason: match.matchReason };
//           }
//           return null;
//         })
//         .filter((j) => j !== null);

//       console.log(`Groq recommended ${recommendedJobs.length} jobs`);
//       return res.json(recommendedJobs);

//     } catch (groqError) {
//       console.error("Groq API error, falling back to skill matching:", groqError.message);
//       return skillMatchFallback(user, jobs, res);
//     }

//   } catch (error) {
//     console.error("AI Recommendation Error:", error);
//     res.status(500).json({ error: "Failed to generate recommendations" });
//   }
// });

// // Fallback: local skill matching if Groq fails or key missing
// function skillMatchFallback(user, jobs, res) {
//   const userSkills = user.skills?.map((s) => s.toLowerCase()) || [];

//   const scored = jobs.map((job) => {
//     const techStack = job.technologyStack.map((t) => t.toLowerCase());
//     const matchedSkills = userSkills.filter((skill) => techStack.includes(skill));
//     const score = matchedSkills.length;

//     return {
//       ...job,
//       score,
//       matchReason:
//         score > 0
//           ? `Matches ${score} of your skill${score > 1 ? "s" : ""}: ${matchedSkills.join(", ")}. Required stack: ${job.technologyStack.join(", ")}.`
//           : `No direct skill match. Required stack: ${job.technologyStack.join(", ")}.`,
//     };
//   });

//   const recommendedJobs = scored
//     .filter((job) => job.score > 0)
//     .sort((a, b) => b.score - a.score)
//     .slice(0, 3);

//   console.log(`Skill match fallback: ${recommendedJobs.length} jobs recommended`);
//   return res.json(recommendedJobs);
// }

// module.exports = router;


const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const Groq = require("groq-sdk");

const User = require("../models/user");
const Job = require("../models/job");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.get("/recommendations", async (req, res) => {
  try {
    const sessionUser = req.session.user;
    if (!sessionUser) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findById(sessionUser.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // 1. Build profile text from skills and/or resume
    const hasSkills = user.skills && user.skills.length > 0;
    const hasResume = !!user.resumeUrl;

    // If no skills and no resume, return empty
    if (!hasSkills && !hasResume) {
      return res.status(400).json({
        error: "Please add your skills or upload a resume to get recommendations.",
      });
    }

    let profileText = "";

    // Add skills if available
    if (hasSkills) {
      profileText += `Skills: ${user.skills.join(", ")}.\n`;
    }

    // Add resume text if available
    if (hasResume) {
      try {
        const resumePath = path.join(__dirname, "../public", user.resumeUrl);
        if (fs.existsSync(resumePath)) {
          const dataBuffer = fs.readFileSync(resumePath);
          const data = await pdfParse(dataBuffer);
          if (data.text && data.text.trim().length > 0) {
            profileText += `\nResume Content:\n${data.text}`;
            console.log("✅ Resume parsed, length:", data.text.length);
          }
        } else {
          console.warn("Resume file not found at path:", resumePath);
        }
      } catch (err) {
        console.error("Error parsing resume:", err.message);
      }
    }

    console.log("Profile text preview:", profileText.substring(0, 200));

    // 2. Fetch all jobs
    const jobs = await Job.find({}).lean();
    if (!jobs || jobs.length === 0) {
      return res.json([]);
    }

    // 3. If no Groq key, fall back to skill matching
    if (!process.env.GROQ_API_KEY) {
      console.warn("No GROQ_API_KEY found. Using skill-matching fallback.");
      return skillMatchFallback(user, jobs, res);
    }

    // 4. Prepare jobs list for Groq
    const jobsText = jobs
      .map(
        (j) =>
          `ID: ${j._id} | Title: ${j.title} | Company: ${j.company} | Tech: ${j.technologyStack.join(", ")} | Requirements: ${j.requirements}`
      )
      .join("\n");

    // 5. Build prompt — handles both skills only, resume only, or both
    const prompt = `
You are an expert technical recruiter. I will provide a candidate's profile and a list of available jobs.
${!hasSkills && hasResume
  ? "The candidate has not listed their skills manually. Please analyze their resume carefully to understand their technical expertise, experience, and background."
  : ""
}
Based on the candidate's profile, identify the top 3 best matching jobs from the list below.

Candidate Profile:
${profileText.substring(0, 3000)}

Available Jobs:
${jobsText}

Respond ONLY with a valid JSON array. No explanation, no markdown, no extra text.
Each object must have exactly two fields:
- "jobId": the exact ID string from the list
- "matchReason": a short 1-2 sentence explanation of why this job is a good fit based on the candidate's profile

Example format:
[{"jobId":"abc123","matchReason":"Your React and Node.js experience from your resume aligns well with this role."},{"jobId":"def456","matchReason":"Your Java background matches the backend requirements of this position."}]
    `;

    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1000,
      });

      let responseText = completion.choices[0]?.message?.content || "[]";

      // Clean up markdown if present
      responseText = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      console.log("Groq raw response:", responseText);

      let matches;
      try {
        matches = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse Groq response as JSON, using fallback");
        return skillMatchFallback(user, jobs, res);
      }

      // 6. Map back to full job objects
      const recommendedJobs = matches
        .map((match) => {
          const job = jobs.find((j) => j._id.toString() === match.jobId);
          if (job) {
            return { ...job, matchReason: match.matchReason };
          }
          return null;
        })
        .filter((j) => j !== null);

      console.log(`✅ Groq recommended ${recommendedJobs.length} jobs`);
      return res.json(recommendedJobs);

    } catch (groqError) {
      console.error("Groq API error, falling back to skill matching:", groqError.message);
      return skillMatchFallback(user, jobs, res);
    }

  } catch (error) {
    console.error("AI Recommendation Error:", error);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
});

// Fallback: local skill matching if Groq fails or key is missing
function skillMatchFallback(user, jobs, res) {
  const userSkills = user.skills?.map((s) => s.toLowerCase()) || [];

  if (userSkills.length === 0) {
    return res.status(400).json({
      error: "Please add your skills or upload a resume to get recommendations.",
    });
  }

  const scored = jobs.map((job) => {
    const techStack = job.technologyStack.map((t) => t.toLowerCase());
    const matchedSkills = userSkills.filter((skill) => techStack.includes(skill));
    const score = matchedSkills.length;

    return {
      ...job,
      score,
      matchReason:
        score > 0
          ? `Matches ${score} of your skill${score > 1 ? "s" : ""}: ${matchedSkills.join(", ")}. Required stack: ${job.technologyStack.join(", ")}.`
          : `No direct skill match. Required stack: ${job.technologyStack.join(", ")}.`,
    };
  });

  const recommendedJobs = scored
    .filter((job) => job.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  console.log(`Skill match fallback: ${recommendedJobs.length} jobs found`);
  return res.json(recommendedJobs);
}

module.exports = router;