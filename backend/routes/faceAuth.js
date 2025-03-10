const express = require('express');
const router = express.Router();
const FaceEmbedding = require('../models/FaceSchema');
const FaceEmbeddingCNN = require('../models/FaceSchemaCNN');
const fetchuser = require('../middleware/fetchuser');
const VerificationData = require('../models/VerificationData');

// Register Face - Handles both new registrations and updates
router.post('/register-face', fetchuser, async (req, res) => {
    try {
        console.log("Register face request received:", req.body);
        const { name, roll_no, embeddings } = req.body;

        // Validation
        if (!name || !embeddings) {
            return res.status(400).json({ error: "Name and embedding are required" });
        }

        if (!Array.isArray(embeddings) || !embeddings.every(Array.isArray)) {
            return res.status(400).json({ error: "Embeddings must be a 2D array" });
        }

        // Check if the roll_no already exists in the database
        const existingUser = await FaceEmbedding.findOne({ roll_no, user: req.user.id });

        // Calculate the average embedding
        const numEmbeddings = embeddings.length;
        console.log("Number of embeddings received: ", numEmbeddings);
        const numDimensions = embeddings[0].length;
        console.log("Number of Dimensions: ", numDimensions);

        // Initialize an array to hold the sum of each dimension
        const sumEmbeddings = new Array(numDimensions).fill(0);
        for (const embedding of embeddings) {
            for (let i = 0; i < numDimensions; i++) {
                sumEmbeddings[i] += embedding[i];
            }
        }

        // Calculate the averaged embedding
        const averagedEmbedding = sumEmbeddings.map(value => value / numEmbeddings);

        // Update or create document
        if (existingUser) {
            // Update the existing user
            console.log(`Updating existing user: ${name} with roll_no: ${roll_no}`);
            const updatedUser = await FaceEmbedding.findOneAndUpdate(
                { roll_no, user: req.user.id },
                { 
                    name,
                    embedding: averagedEmbedding
                },
                { new: true }
            );
            
            return res.status(200).json({ 
                message: "Face data updated successfully!",
                updated: true,
                details: { name: updatedUser.name, roll_no: updatedUser.roll_no }
            });
            
        }

        // Create a new FaceEmbedding document with the averaged embedding
        const newFace = new FaceEmbedding({
            user: req.user.id,
            name,
            roll_no,
            embedding: averagedEmbedding,
        });

        await newFace.save();
        console.log(`New face registered: ${name} with roll_no: ${roll_no}`);
        res.status(201).json({ 
            message: "Face registered successfully!",
            details: { name, roll_no }
        });
    } catch (error) {
        console.error("Error storing embedding:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

router.post('/register-face-cnn', fetchuser, async (req, res) => {
    try {
        console.log("Register CNN face request received:", req.body);
        const { name, roll_no, embeddings } = req.body;

        // Validation
        if (!name || !embeddings) {
            return res.status(400).json({ error: "Name and embedding are required" });
        }

        if (!Array.isArray(embeddings) || !embeddings.every(Array.isArray)) {
            return res.status(400).json({ error: "Embeddings must be a 2D array" });
        }

        // Check if the roll_no already exists
        const existingUser = await FaceEmbeddingCNN.findOne({ roll_no, user: req.user.id });

        // Calculate the average embedding
        const numEmbeddings = embeddings.length;
        const numDimensions = embeddings[0].length;
        
        const sumEmbeddings = new Array(numDimensions).fill(0);
        for (const embedding of embeddings) {
            for (let i = 0; i < numDimensions; i++) {
                sumEmbeddings[i] += embedding[i];
            }
        }

        const averagedEmbedding = sumEmbeddings.map(value => value / numEmbeddings);

        // Update or create
        if (existingUser) {
            console.log(`Updating existing CNN user: ${name} with roll_no: ${roll_no}`);
            const updatedUser = await FaceEmbeddingCNN.findOneAndUpdate(
                { roll_no, user: req.user.id },
                { 
                    name,
                    embedding: averagedEmbedding
                },
                { new: true }
            );
            
            return res.status(200).json({ 
                message: "Face data updated successfully!",
                updated: true,
                details: { name: updatedUser.name, roll_no: updatedUser.roll_no }
            });
        }

        // Create new record
        const newFace = new FaceEmbeddingCNN({
            user: req.user.id,
            name,
            roll_no,
            embedding: averagedEmbedding,
        });

        await newFace.save();
        console.log(`New CNN face registered: ${name} with roll_no: ${roll_no}`);
        res.status(201).json({ 
            message: "Face registered successfully!",
            details: { name, roll_no }
        });
    } catch (error) {
        console.error("Error storing CNN embedding:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// Authenticate a face
router.post('/authenticate', fetchuser, async (req, res) => {
    try {
        const { embedding } = req.body;
        console.log("Authentication request received");
        
        if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
            return res.status(400).json({ error: "Valid embedding is required for authentication" });
        }

        // Fetch all stored embeddings for the logged-in user
        const storedFaces = await FaceEmbedding.find({ user: req.user.id });

        if (storedFaces.length === 0) {
            return res.status(404).json({ message: "No registered faces found for authentication" });
        }

        // Compare the received embedding with stored embeddings
        let bestMatch = null;
        let minDistance = Infinity;

        for (const face of storedFaces) {
            const storedEmbedding = face.embedding;
        
            if (embedding.length !== storedEmbedding.length) {
                console.error(`Mismatched embedding lengths: received=${embedding.length}, stored=${storedEmbedding.length}`);
                continue; // Skip this face
            }
        
            // Calculate Euclidean distance
            const distance = Math.sqrt(
                embedding.reduce((sum, value, idx) => sum + Math.pow(value - storedEmbedding[idx], 2), 0)
            );
            console.log(`Distance to ${face.name}: ${distance}`);
            
            if (distance < minDistance) {
                minDistance = distance;
                bestMatch = face;
            }
        }
        
        // Decide match based on threshold
        const threshold = 0.75; // Adjust based on testing
        if (minDistance <= threshold && bestMatch) {
            console.log(`Successful match: ${bestMatch.name} with distance ${minDistance}`);
            return res.status(200).json({
                message: "Person identified successfully",
                name: bestMatch.name,
                roll_no: bestMatch.roll_no,
                distance: minDistance,
                confidence: (1 - minDistance/threshold) * 100
            });
        } else {
            console.log(`No match found. Best distance was ${minDistance}`);
            return res.status(200).json({ 
                message: "No match found",
                bestDistance: minDistance,
                threshold: threshold
            });
        }
    } catch (error) {
        console.error("Error during authentication:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

router.post('/authenticate-cnn', fetchuser, async (req, res) => {
    try {
        const { embedding } = req.body;
        console.log("CNN Authentication request received");
        
        if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
            return res.status(400).json({ error: "Valid embedding is required for authentication" });
        }

        // Fetch all stored CNN embeddings for the logged-in user
        const storedFaces = await FaceEmbeddingCNN.find({ user: req.user.id });

        if (storedFaces.length === 0) {
            return res.status(404).json({ message: "No registered CNN faces found for authentication" });
        }

        // Compare the received embedding with stored embeddings
        let bestMatch = null;
        let minDistance = Infinity;

        for (const face of storedFaces) {
            const storedEmbedding = face.embedding;
        
            if (embedding.length !== storedEmbedding.length) {
                console.error(`Mismatched CNN embedding lengths: received=${embedding.length}, stored=${storedEmbedding.length}`);
                continue; // Skip this face
            }
        
            // Calculate Euclidean distance
            const distance = Math.sqrt(
                embedding.reduce((sum, value, idx) => sum + Math.pow(value - storedEmbedding[idx], 2), 0)
            );
            console.log(`CNN Distance to ${face.name}: ${distance}`);
            
            if (distance < minDistance) {
                minDistance = distance;
                bestMatch = face;
            }
        }
        
        // Decide match based on threshold
        const threshold = 0.75; // Adjust based on testing
        if (minDistance <= threshold && bestMatch) {
            console.log(`Successful CNN match: ${bestMatch.name} with distance ${minDistance}`);
            return res.status(200).json({
                message: "Person identified successfully",
                name: bestMatch.name,
                roll_no: bestMatch.roll_no,
                distance: minDistance,
                confidence: (1 - minDistance/threshold) * 100
            });
        } else {
            console.log(`No CNN match found. Best distance was ${minDistance}`);
            return res.status(200).json({ 
                message: "No match found",
                bestDistance: minDistance,
                threshold: threshold
            });
        }
    } catch (error) {
        console.error("Error during CNN authentication:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// Group authentication for multiple faces
router.post('/groupauthenticate', fetchuser, async (req, res) => {
    try {
        const { embeddings } = req.body;
        console.log("Group authentication request received:", embeddings.length, "embeddings");

        if (!embeddings || !Array.isArray(embeddings) || embeddings.length === 0) {
            return res.status(400).json({ error: "Valid embeddings are required for group authentication" });
        }

        // Fetch all stored embeddings for the logged-in user
        const storedFaces = await FaceEmbedding.find({ user: req.user.id });

        if (storedFaces.length === 0) {
            return res.status(404).json({ message: "No registered faces found for authentication" });
        }

        const threshold = 0.75;
        const results = [];

        // Process each embedding
        for (const embedding of embeddings) {
            let bestMatch = null;
            let minDistance = Infinity;

            // Compare against all stored faces
            for (const face of storedFaces) {
                const storedEmbedding = face.embedding;

                if (embedding.length !== storedEmbedding.length) {
                    console.error(`Mismatched embedding lengths in group auth: received=${embedding.length}, stored=${storedEmbedding.length}`);
                    continue;
                }

                const distance = Math.sqrt(
                    embedding.reduce((sum, value, idx) => sum + Math.pow(value - storedEmbedding[idx], 2), 0)
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    bestMatch = face;
                }
            }

            // Add result for this embedding
            if (minDistance <= threshold && bestMatch) {
                results.push({
                    match: true,
                    name: bestMatch.name,
                    roll_no: bestMatch.roll_no,
                    distance: minDistance,
                    confidence: (1 - minDistance/threshold) * 100
                });
            } else {
                results.push({ 
                    match: false, 
                    message: "No match found",
                    bestDistance: minDistance
                });
            }
        }

        return res.status(200).json({ results });
    } catch (error) {
        console.error("Error during group authentication:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// Delete face labels
router.delete('/delete-labels/:label', fetchuser, async (req, res) => {
    try {
        const name = req.params.label;
        const modelType = req.query['model-type'];
        console.log('DELETE request received for label:', name, 'ModelType:', modelType);

        if (!name) {
            return res.status(400).json({ error: 'Label parameter is required' });
        }

        let result;
        
        if (!modelType || modelType === 'PTM') {
            result = await FaceEmbedding.deleteOne({ user: req.user.id, name });
            console.log('PTM delete operation result:', result);
        } else if (modelType === 'CNN') {
            result = await FaceEmbeddingCNN.deleteOne({ user: req.user.id, name });
            console.log('CNN delete operation result:', result);
        } else {
            return res.status(400).json({ error: 'Invalid Model Type' });
        }
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Label not found or already deleted' });
        }

        res.json({ message: 'Label removed successfully' });
    } catch (error) {
        console.error('Error deleting label:', error);
        res.status(500).json({ error: 'An internal server error occurred', details: error.message });
    }
});

// Store verification data
router.post('/store-verification', fetchuser, async (req, res) => {
    try {
        const { labelName } = req.body;

        if (!labelName) {
            return res.status(400).json({ message: 'Label name is required.' });
        }

        // Get the start and end of the current day
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        // Check if a verification entry already exists for this user and label today
        const existingVerification = await VerificationData.findOne({
            user: req.user.id,
            labelName,
            createdAt: { $gte: startOfDay, $lte: endOfDay },
        });

        if (existingVerification) {
            return res.status(200).json({ 
                message: 'Already verified today.',
                verified: true,
                time: existingVerification.createdAt
            });
        }

        // Store new verification
        const verification = new VerificationData({
            user: req.user.id,
            labelName,
        });

        await verification.save();
        res.status(201).json({ 
            message: 'Verification data stored successfully.',
            verified: true,
            time: verification.createdAt
        });
    } catch (error) {
        console.error('Error storing verification data:', error);
        res.status(500).json({ 
            message: 'Failed to store verification data.',
            error: error.message
        });
    }
});

// Get verification history
router.get('/verification-history', fetchuser, async (req, res) => {
    try {
        const user = req.user.id;
        
        // Optional date filtering
        const { startDate, endDate } = req.query;
        let dateFilter = {};
        
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }
        
        const history = await VerificationData.find({ 
            user,
            ...dateFilter
        }).sort({ createdAt: -1 }); // Most recent first
        
        res.json({ history });
    } catch (error) {
        console.error('Error fetching verification history:', error);
        res.status(500).json({ message: 'Server error', details: error.message });
    }
});

module.exports = router;