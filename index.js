const express = require("express")
const multer = require("multer")
const bodyParser = require("body-parser")
const { execFile, execFileSync } = require("child_process")
const mongoose = require('mongoose')
const moment = require('moment')
const path = require("path")
const buffer = require('buffer')


const app = express()
const port = process.env.PORT || 3000

//multer setup
const Storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "./Image/")
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + "_" + file.originalname);
    }
})

const upload = multer({ storage: Storage })

//db setup
var detectSchema = new mongoose.Schema({
    Count: Number,
    Filename: String,
    Date: { type: Date, default: Date.now }
})
var Data = mongoose.model('detectData', detectSchema)

//db connect 
const dburl = process.env.MONGOLAB_URI || 'mongodb+srv://b05204037:Jason870214@cluster0-schdz.mongodb.net/test?retryWrites=true&w=majority'
mongoose.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
    .then(() => console.log('connect to db'))
    .catch(err => console.log(err))

//app router 
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
                //stdout will look like 2 ./Image/1581502076019_IMG_8639_yolo_out_py.jpg
                //result[0] is count [1] is outputpath
                
                result = stdout.split(" ")
                
                let count = parseInt(result[0])
                let filename = result[1].replace('\n', '').replace('\r', '')
                
                let saveData = new Data({
                    'Count': count,
                    'Filename': filename 
                })

                saveData.save()
                    .then(() => console.log("save to db"))
                    .catch(err => console.log(err))

                console.log('count : ', count)
                console.log('filename : ', filename)
                
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
        let result = fileBuffer.toString()
        let result_splited = result.split(" ")

        let count = parseInt(result_splited[0])
        let filename = result_splited[1].replace("\n", "").replace("\r", "")

        let time = new Date
        let saveData = new Data({
            'Count': count,
            'Filename': filename
        })
        saveData.save()
            .then(() => console.log('save to db'))
            .catch(err => console.log(err))
    
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


app.get('/api/getData', (req, res) => {
    
    let today = moment().startOf('day')

    Data.find({ "Date" : {"$gte": today.toDate(), "$lt": moment(today).endOf('day').toDate()}}, (err, docs) => {
        if(err) console.log(err)
        else {
            console.log(docs)
            res.json(docs)
        }
    })
})

app.listen(port, () => {
    console.log(`listen to ${port}`)
})