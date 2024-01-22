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

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
