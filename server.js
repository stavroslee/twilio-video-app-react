const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
require('dotenv').config();

const MAX_ALLOWED_SESSION_DURATION = 14400;
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioApiKeySID = process.env.TWILIO_API_KEY_SID;
const twilioApiKeySecret = process.env.TWILIO_API_KEY_SECRET;

app.use(express.static(path.join(__dirname, 'build')));
let jsonParser = bodyParser.json()

app.post('/token', jsonParser, (req, res) => {
  const { user_identity:identity, room_name:roomName } = req.body;
  res.send(getToken(identity, roomName));
});

function getToken(identity, roomName) {
  const token = new AccessToken(twilioAccountSid, twilioApiKeySID, twilioApiKeySecret, {
    ttl: MAX_ALLOWED_SESSION_DURATION,
  });
  token.identity = identity;
  const videoGrant = new VideoGrant({ room: roomName });
  token.addGrant(videoGrant);
  console.log(`issued token for ${identity} in room ${roomName}`);
  return JSON.stringify({token:token.toJwt()});  
}

app.get('/token', (req, res) => {
  const { identity, roomName } = req.query;
  let jwt = getToken(identity, roomName);
  res.send(jwt);
});

app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'build/index.html')));

app.listen(8081, () => console.log('token server running on 8081'));
