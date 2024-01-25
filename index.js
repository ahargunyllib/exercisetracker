const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
require('dotenv').config()

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  }
})
userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
		delete returnedObject.__v;
	}
});
let User = mongoose.model('user', userSchema)

const exerciseSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: false
  }
})
exerciseSchema.set("toJSON", {
  transform: (document, returnedObject) => {
		delete returnedObject.__v;
	}
});
let Exercise = mongoose.model('exercise', exerciseSchema)


app.use(cors())
app.use(express.json());
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req, res) => {
  const username = req.body.username
  let newUser = new User({
    username: username
  })
  await newUser.save();
  res.json(newUser)
})

app.get('/api/users', async (req, res) => {
  const users = await User.find({})
  let usersJson = []
  users.forEach((u) => {
    usersJson.push({
      _id: u._id,
      username: u.username
    })
  })
  res.json(usersJson);
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  const _id = req.params._id
  const description = req.body.description
  const duration = Number(req.body.duration)
  const date = typeof(req.body.date) === 'undefined' ? new Date(Date.now()) : new Date(Date.parse(req.body.date))
  const user = await User.findById(_id)

  let newExercise = new Exercise({
    userId: _id,
    description: description,
    duration: duration,
    date: date,
  })
  await newExercise.save()

  res.json({
    username: user.username,
    description: description,
    duration: duration,
    date: date.toDateString(),
    _id: _id
  })
})

app.get("/api/users/:_id/logs", async (req, res) => {
  const _id = req.params._id
  const from = new Date(Date.parse(req.query.from))
  const to = new Date(Date.parse(req.query.to))
  const limit = req.query.limit
  const user = await User.findById(_id)

  let logs;
  if (typeof(req.query.from) !== 'undefined') {
    logs = await Exercise.find({ userId: _id , date: {$gte: from, $lte: to}})
  } else {
    logs = await Exercise.find({ userId: _id })
  }

  let logsJson = []
  const count = (typeof(limit) !== 'undefined' ? limit : logs.length)
  for (let i = 0; i < count; i++){
    const l = {
      description: logs[i].description,
      duration: logs[i].duration,
      date: logs[i].date.toDateString()
    }
    logsJson.push(l)
  }

  res.json({
    username: user.username,
    count: count,
    _id: _id,
    log: logsJson
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
