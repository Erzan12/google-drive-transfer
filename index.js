require("dotenv").config();
const express = require("express");
const { google } = require("googleapis");
const open = require("open").default;

const app = express();
const PORT = 3000;

// Load OAuth2 credentials from .env
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/auth/callback";

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Step 1: Login with Google
app.get("/auth", async (req, res) => {
    try {
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: ["https://www.googleapis.com/auth/drive"],
        });

        await open(authUrl); // This opens the URL in your browser
        res.send("Check your browser to log in!");
    } catch (error) {
        console.error("Error in auth route:", error);
        res.status(500).send("Authentication failed.");
    }
});

// Step 2: Handle Google OAuth Callback
app.get("/auth/callback", async (req, res) => {
    const code = req.query.code;
    if (!code) return res.send("Authorization failed!");

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    res.send("Authentication successful! You can now transfer ownership.");
});

// Fetch files from the owner
app.get("/files", async (req, res) => {
    const drive = google.drive({ version: "v3", auth: oauth2Client });

    try {
        const response = await drive.files.list({
            q: "'me' in owners", // Get files where the user is the owner
            fields: "files(id, name, owners)",
        });

        res.json(response.data.files);
    } catch (error) {
        res.status(500).send("Error fetching files: " + error.message);
    }
});


// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));