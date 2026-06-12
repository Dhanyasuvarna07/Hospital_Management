const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234", // Change if needed
    database: "hospital_db"
});

db.connect((err) => {
    if (err) {
        console.log("Database Connection Error:");
        console.log(err);
    } else {
        console.log("MySQL Connected");
    }
});

// =====================
// GET ALL PATIENTS
// =====================
app.get("/patients", (req, res) => {
    db.query(
        "SELECT * FROM patients",
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }
            res.json(result);
        }
    );
});

// =====================
// ADD PATIENT
// =====================
app.post("/patients", (req, res) => {
    const { name, age, gender } = req.body;

    db.query(
        "INSERT INTO patients (PatientName, Age, Gender) VALUES (?, ?, ?)",
        [name, age, gender],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }

            res.json({
                message: "Patient Added Successfully"
            });
        }
    );
});

// =====================
// UPDATE PATIENT
// =====================
app.put("/patients/:id", (req, res) => {
    const id = req.params.id;
    const { name, age, gender } = req.body;

    db.query(
        "UPDATE patients SET PatientName=?, Age=?, Gender=? WHERE PatientID=?",
        [name, age, gender, id],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }

            res.json({
                message: "Patient Updated Successfully"
            });
        }
    );
});

// =====================
// DELETE PATIENT
// =====================
app.delete("/patients/:id", (req, res) => {
    db.query("DELETE FROM appointments WHERE PatientID=?", [req.params.id], () => {

    db.query("DELETE FROM bills WHERE PatientID=?", [req.params.id], () => {

        db.query("DELETE FROM treatments WHERE PatientID=?", [req.params.id], () => {

            db.query(
                "DELETE FROM patients WHERE PatientID=?",
                [req.params.id],
                (err, result) => {
                    if (err) return res.status(500).json(err);
                    res.json({ message: "Patient Deleted Successfully" });
                }
            );

        });

    });

});
});

// =====================
// GENERATE BILL
// =====================
app.post("/generateBill", (req, res) => {

    const { patientId, cost } = req.body;

    db.query(
        "INSERT INTO bills (PatientID, Amount) VALUES (?, ?)",
        [patientId, cost],
        (err, result) => {

            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }

            res.json({
                message: "Bill Generated Successfully"
            });
        }
    );
});

// =====================
// GET ALL BILLS
// =====================
app.get("/bills", (req, res) => {

    db.query(
        `SELECT p.PatientName, b.Amount
         FROM bills b
         JOIN patients p
         ON p.PatientID = b.PatientID`,
        (err, result) => {

            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }

            res.json(result);
        }
    );
});

// =====================
// ADD APPOINTMENT
// =====================
app.post("/appointment", (req, res) => {

    const { patientId } = req.body;

    db.query(
        "INSERT INTO appointments (PatientID) VALUES (?)",
        [patientId],
        (err, result) => {

            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }

            res.json({ message: "Appointment Added Successfully" });
        }
    );
});
// =====================
// START SERVER
// =====================
app.listen(3000, () => {
    console.log("Server Running On Port 3000");
});