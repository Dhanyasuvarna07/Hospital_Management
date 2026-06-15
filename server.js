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
app.get("/appointments", (req,res)=>{
    db.query(
        "SELECT * FROM Appointments",
        (err,result)=>{
            if(err){
                console.log(err);
                return res.status(500).json(err);
            }
            res.json(result);
        }
    );
});

// =====================
// ADD PATIENT
app.post('/patients', (req,res)=>{

    console.log(req.body);

    const {name, age, department, gender} = req.body;

    const sql = `
        INSERT INTO Patients
        (PatientName, Age, Department, Gender)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [name, age, department, gender],
        (err,result)=>{
            if(err){
                console.log(err);
                return res.status(500).json(err);
            }

            res.json({
                message:"Patient Added"
            });
        }
    );
});
app.put("/patients/:id", (req, res) => {

    const { name, age, gender } = req.body;

    db.query(
        `UPDATE Patients
         SET PatientName=?, Age=?, Gender=?
         WHERE PatientID=?`,
        [name, age, gender, req.params.id],
        (err) => {

            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }

            res.json({
                message: "Patient Updated"
            });
        }
    );
});
// =====================
// UPDATE PATIENT
// =====================
app.get("/bills", (req, res) => {

    const sql = `
        SELECT
            b.BillID,
            b.PatientID,
            p.PatientName,
            b.Amount
        FROM Bills b
        LEFT JOIN Patients p
        ON b.PatientID = p.PatientID
        ORDER BY b.BillID DESC
    `;

    db.query(sql, (err, result) => {

        if(err){
            console.log(err);
            return res.status(500).json(err);
        }

        console.log("BILLS RESULT:", result);

        res.json(result);
    });
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
console.log("GENERATE BILL API CALLED");
console.log("BODY:", req.body);
    const { patientId, cost } = req.body;

    console.log("Received:", patientId, cost);

    db.query(
        "SELECT * FROM Patients WHERE PatientID=?",
        [patientId],
        (err,result)=>{
 console.log("Received:", patientId);
        console.log("PATIENT SEARCH:", result);
        console.log("Rows Found:", result.length);


            if(err){
                console.log(err);
                return res.json(err);
            }

            if(result.length===0){
                return res.json({
                    message:"Patient ID does not exist"
                });
            }

            console.log("FOUND PATIENT");

            db.query(
                "INSERT INTO Bills (PatientID,Amount) VALUES (?,?)",
                [patientId,cost],
                (err)=>{

                    if(err){
                        console.log(err);
                        return res.json(err);
                    }

                    console.log("BILL INSERTED");

                    res.json({
                        message:"Bill Generated"
                    });
                }
            );
        }
    );
});
           
// =====================
// ADD APPOINTMENT
// =====================
app.post("/appointments", (req, res) => {

    const { patientId } = req.body;

    db.query(
        "INSERT INTO Appointments (PatientID) VALUES (?)",
        [patientId],
        (err) => {

            if (err) return res.json(err);

            db.query(
                "UPDATE Patients SET VisitCount = VisitCount + 1 WHERE PatientID = ?",
                [patientId],
                (err2) => {

                    if (err2) return res.json(err2);

                    res.json({
                        message: "Appointment Added"
                    });
                }
            );
        }
    );
});
// =====================
// START SERVER
// =====================
app.listen(3000, () => {
    console.log("Server Running On Port 3000");
});
