const express = require('express')
const router = express.Router()
const axios = require('axios');
const FaceEmbedding = require('../models/FaceSchema');
const FaceEmbeddingCNN = require('../models/FaceSchemaCNN');
const fetchuser = require('../middleware/fetchuser');
const AuthenticationLog =require('../models/AuthLog');

// Register Face - Calls Python service to generate embedding, then saves it in MongoDB


router.post('/register-face', fetchuser, async (req, res) => {
    try {
        console.log(req.body);
        // const { name, embedding } = req.body;
        const name = req.body.name;
        const roll_no=req.body.roll_no;
        const branch=req.body.branch;
        const year=req.body.year;
        const section=req.body.section;
        const embeddings = req.body.embeddings;

        
        if (!name || !embeddings) {
            return res.status(400).json({ error: "Name and embedding are required" });
        }

                // Ensure embeddings is a 2D array
                if (!Array.isArray(embeddings) || !embeddings.every(Array.isArray)) {
                    return res.status(400).json({ error: "Embeddings must be a 2D array" });
                }

            // Flatten the 2D array of embeddings into a single array of embeddings
            // const flattenedEmbeddings = embedding.map(embedding => embedding[0]);

                // Calculate the average of the embeddings
                const numEmbeddings = embeddings.length;
                console.log("Number of embeddings received: ",numEmbeddings)
                const numDimensions = embeddings[0].length; // Assuming all embeddings have the same length
                console.log("Number of Dimensions: ",numDimensions)

                // Initialize an array to hold the sum of each dimension
                const sumEmbeddings = new Array(numDimensions).fill(0);
                for (const embedding of embeddings) {
                    for (let i = 0; i < numDimensions; i++) {
                        sumEmbeddings[i] += embedding[i]; // Accessing the first element of each embedding
                    }
                }

                // Calculate averaged embedding
                
                const averagedEmbedding = sumEmbeddings.map(value => value / numEmbeddings);
                
                
                // const averagedEmbedding = flattenedEmbeddings.reduce((avg, emb) => {
                //     return avg.map((value, index) => value + emb[index]);
                // }, new Array(flattenedEmbeddings[0].length).fill(0)).map(value => value / flattenedEmbeddings.length);
            

        const newFace = new FaceEmbedding({
            user: req.user.id, // Link embedding to logged-in user
            name,
            roll_no,
            branch,
            year,
            section,
            embedding: averagedEmbedding, // Store the averaged embedding
        });
        console.log(averagedEmbedding)

        await newFace.save();
        res.status(200).json({ message: "Face registered successfully!" });
    } catch (error) {
        console.error("Error storing embedding:", error.message);
        res.status(500).send("Internal Server Error");
    }
});
router.post('/register-face-cnn', fetchuser, async (req, res) => {
    try {
        console.log(req.body);
        // const { name, embedding } = req.body;
        const name = req.body.name;
        const roll_no=req.body.roll_no;
        const branch=req.body.branch;
        const year=req.body.year;
        const section=req.body.section;
        const embeddings = req.body.embeddings

        
        if (!name || !embeddings) {
            return res.status(400).json({ error: "Name and embedding are required" });
        }

                // Ensure embeddings is a 2D array
                if (!Array.isArray(embeddings) || !embeddings.every(Array.isArray)) {
                    return res.status(400).json({ error: "Embeddings must be a 2D array" });
                }

            // Flatten the 2D array of embeddings into a single array of embeddings
            // const flattenedEmbeddings = embedding.map(embedding => embedding[0]);

                // Calculate the average of the embeddings
                const numEmbeddings = embeddings.length;
                console.log("Number of embeddings received: ",numEmbeddings)
                const numDimensions = embeddings[0].length; // Assuming all embeddings have the same length
                console.log("Number of Dimensions: ",numDimensions)

                // Initialize an array to hold the sum of each dimension
                const sumEmbeddings = new Array(numDimensions).fill(0);
                for (const embedding of embeddings) {
                    for (let i = 0; i < numDimensions; i++) {
                        sumEmbeddings[i] += embedding[i]; // Accessing the first element of each embedding
                    }
                }

                // Calculate averaged embedding
                
                const averagedEmbedding = sumEmbeddings.map(value => value / numEmbeddings);
                
                
                // const averagedEmbedding = flattenedEmbeddings.reduce((avg, emb) => {
                //     return avg.map((value, index) => value + emb[index]);
                // }, new Array(flattenedEmbeddings[0].length).fill(0)).map(value => value / flattenedEmbeddings.length);
            

        const newFace = new FaceEmbeddingCNN({
            user: req.user.id, // Link embedding to logged-in user
            name,
            roll_no,
            branch,
            year,
            section,
            embedding: averagedEmbedding, // Store the averaged embedding
        });
        console.log(averagedEmbedding)

        await newFace.save();
        res.status(200).json({ message: "Face registered successfully!" });
    } catch (error) {
        console.error("Error storing embedding:", error.message);
        res.status(500).send("Internal Server Error");
    }
});


router.post('/authenticate', fetchuser, async (req, res) => {
    try {
        const { embedding } = req.body; // Receiving embedding from frontend
        console.log("Received embedding from Frontend");
        console.log("Received Embedding:", embedding);

        if (!embedding || embedding.length === 0) {
            return res.status(400).json({ error: "Embedding is required for authentication" });
        }

        // Step 1: Fetch all stored embeddings for the logged-in user
        const storedFaces = await FaceEmbedding.find({ user: req.user.id });

        if (storedFaces.length === 0) {
            return res.status(404).json({ message: "No registered faces found for authentication" });
        }

        // Step 2: Compare the received embedding with stored embeddings
        let bestMatch = null;
        let minDistance = Infinity;

        for (const face of storedFaces) {
            const storedEmbedding = face.embedding;
        
            if (embedding.length !== storedEmbedding.length) {
                console.error(`Mismatched lengths: received=${embedding.length}, stored=${storedEmbedding.length}`);
                continue; // Skip this face
            }
        
            // Calculate distance only if lengths match
            const distance = Math.sqrt(
                embedding.reduce((sum, value, idx) => sum + Math.pow(value - storedEmbedding[idx], 2), 0)
            );
            console.log(`Distance to ${face.name}: ${distance}`);
        
        
            
            if (distance < minDistance) {
                minDistance = distance;
                bestMatch = face;
            }
        }
        

        // Step 3: Decide match threshold (adjust this based on testing)
        const threshold = 0.75; // Set an appropriate threshold based on your model's performance
        if (minDistance <= threshold && bestMatch) {
            return res.status(200).json({
                message: "Person identified successfully",
                name: bestMatch.name,
                roll_no: bestMatch.roll_no,
                branch: bestMatch.branch,
                year: bestMatch.year,
                section: bestMatch.section,
                details: bestMatch, // Include any other stored details
            });
        } else {
            return res.status(200).json({ message: "No match found" });
        }
    } catch (error) {
        console.error("Error during authentication:", error.message);
        res.status(500).send("Internal Server Error");
    }
});
router.post('/authenticate-cnn', fetchuser, async (req, res) => {
    try {
        const { embedding } = req.body; // Receiving embedding from frontend
        console.log("Received embedding from Frontend");
        console.log("Received Embedding:", embedding);

        if (!embedding || embedding.length === 0) {
            return res.status(400).json({ error: "Embedding is required for authentication" });
        }

        // Step 1: Fetch all stored embeddings for the logged-in user
        const storedFaces = await FaceEmbeddingCNN.find({ user: req.user.id });

        if (storedFaces.length === 0) {
            return res.status(404).json({ message: "No registered faces found for authentication" });
        }

        // Step 2: Compare the received embedding with stored embeddings
        let bestMatch = null;
        let minDistance = Infinity;

        for (const face of storedFaces) {
            const storedEmbedding = face.embedding;
        
            if (embedding.length !== storedEmbedding.length) {
                console.error(`Mismatched lengths: received=${embedding.length}, stored=${storedEmbedding.length}`);
                continue; // Skip this face
            }
        
            // Calculate distance only if lengths match
            const distance = Math.sqrt(
                embedding.reduce((sum, value, idx) => sum + Math.pow(value - storedEmbedding[idx], 2), 0)
            );
            console.log(`Distance to ${face.name}: ${distance}`);
        
        
            
            if (distance < minDistance) {
                minDistance = distance;
                bestMatch = face;
            }
        }
        

        // Step 3: Decide match threshold (adjust this based on testing)
        const threshold = 0.75; // Set an appropriate threshold based on your model's performance
        if (minDistance <= threshold && bestMatch) {
            return res.status(200).json({
                message: "Person identified successfully",
                name: bestMatch.name,
                roll_no: bestMatch.roll_no,
                branch: bestMatch.branch,
                year: bestMatch.year,
                section: bestMatch.section,
                details: bestMatch, // Include any other stored details
            });
        } else {
            return res.status(200).json({ message: "No match found" });
        }
    } catch (error) {
        console.error("Error during authentication:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

router.delete('/delete-labels/:label', fetchuser, async (req, res) => {
    try {
        const name = req.params.label;
        const modelType = req.query['model-type'];
        console.log('DELETE request received for label:', name, 'ModelType: ', modelType);

        if (!name || !modelType) {
            return res.status(400).json({ error: 'Label & ModelType parameters are required' });
        }

        if(modelType==='CNN') {
            result = await FaceEmbedding.deleteOne({ user: req.user.id, name });
        } else if (modelType==='PTM') {
            result = await FaceEmbeddingCNN.deleteOne({ user: req.user.id, name });
        } else {
            return res.status(400).json({ error: 'Invalid Model Type'});
        }
        
        console.log('Delete operation result:', result);

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Label not found or already deleted' });
        }

        res.json({ message: 'Label removed successfully' });
    } catch (error) {
        console.error('Error deleting label:', error.message);
        res.status(500).json({ error: 'An internal server error occurred while deleting the label' });
    }
});



router.post("/log", fetchuser, async (req, res) => {
  const userId = req.user.id; // The userId is attached from the JWT token
  const { name, rollNo, dateTime } = req.body;

  if (!userId || !name || !rollNo || !dateTime) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  // Extract the date part of the dateTime (i.e., remove the time)
  const currentDate = new Date(dateTime).toISOString().split('T')[0]; // "YYYY-MM-DD"

  try {
    // Check if a log for this user, rollNo, and current date already exists
    const existingLog = await AuthenticationLog.findOne({
      userId,
      rollNo,
      dateTime: { $gte: new Date(currentDate), $lt: new Date(new Date(currentDate).setDate(new Date(currentDate).getDate() + 1)) }
    });

    if (existingLog) {
      return res.status(400).json({ success: false, error: "Log for this user already exists for today" });
    }

    // Save the new log if no log exists for today
    const newLog = new AuthenticationLog({ userId, name, rollNo, dateTime });
    await newLog.save();

    res.status(201).json({ success: true, message: "Log saved successfully" });
  } catch (error) {
    console.error("Error saving log:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});




router.get('/getlogs', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id; // Extract userId from auth middleware
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0); // Start of yesterday

        // Fetch records with matching userId and date in range
        const logs = await AuthenticationLog.find({
            userId, // Filter by userId
            dateTime: {
                $gte: yesterday, // From yesterday 00:00:00
                $lte: today,     // Up to today 23:59:59
            },
        });

        res.json({ logs });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).send('Server Error');
    }
});


module.exports = router;









