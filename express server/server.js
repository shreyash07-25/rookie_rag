const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

// Serve the frontend from the "public" folder
app.use(express.static("public"));

app.post("/upload-pdf", upload.single("pdf"), async (req, res) => {
    if (!req.file || !req.body.question) {
        if (req.file) fs.unlink(req.file.path, () => {});
        return res.status(400).json({ error: "Send a 'pdf' file and a 'question'" });
    }

    try {
        const form = new FormData();
        form.append("file", fs.createReadStream(req.file.path), {
            filename: req.file.originalname,
            contentType: "application/pdf",
        });
        form.append("question", req.body.question);

        const response = await axios.post(
            "http://127.0.0.1:8000/process-pdf",
            form,
            {
                headers: form.getHeaders(),
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: "PDF processing failed" });
    } finally {
        fs.unlink(req.file.path, () => {});
    }
});

app.listen(3000, () => {
    console.log("Express running on http://localhost:3000");
});
