const express = require("express")
const multer = require("multer")
const bodyParser = require("body-parser")
const { execFile, execFileSync } = require("child_process")
const path = require("path")
const buffer = require('buffer')


const app = express()
const port = process.env.PORT || 3000


const Storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "./Image/")
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + "_" + file.originalname);
    }
})

const upload = multer({ storage: Storage })


app.use(express.json())
app.use(bodyParser.json())


app.get("/", (req, res) => {
    res.send("hello world")
})

app.get("/api/getImage", (req, res) => {
    console.log("getreq")
    res.send();
})


//upload.single("uploadedFile") the name inside the () should be the name of the file 
app.post("/api/postImage", upload.single("uploadedFile"), (req, res) => {
    if (req.file) {
        console.log(req.header)
        console.log(req.file)

        execFile('python', ["./yolo_py/object_detection_yolo.py", "--image=./Image/" + req.file.filename], (err, stdout, stderr) => {
            if (err) console.log(err)
            else {
                let option = {
                    root: __dirname
                }
                let filename = stdout.replace('\n', '')

                console.log('stdout: ', filename)
                res.sendFile(filename, option, (err) => {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        console.log('Sent:', filename)
                    }
                })
            }
        })

    }
    else {
        return res.send({ result: false })
    }
})

app.post('/api/getImageSysc', upload.single('uploadedFile'), (req, res) => {
    if (req.file) {
        let fileBuffer = execFileSync('python', ["./yolo_py/object_detection_yolo.py", "--image=./Image/" + req.file.filename])
        let filename = fileBuffer.toString()
        filename = filename.replace("\n", "")
        filename = filename.replace("\r", "")
        let option = {
            root: __dirname
        }
        res.sendFile(filename, option, (err) => {
            if (err) console.log(err)
            else console.log('Sent : ', filename)
        })
    }
    else {
        return res.send({ result: false })
    }
})

app.listen(port, () => {
    console.log(`listen to ${port}`)
})