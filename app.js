const express = require('express')
app = express()
const path = require('path')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
app.use(express.json())
db_path = path.join(__dirname, 'cricketTeam.db')
let db = null

const intializeSeverDatabasae = async () => {
  try {
    db = await open({
      filename: db_path,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server started succesfully at https://localhost:3000')
    })
  } catch (e) {
    console.log(`${e} in connecting to Database`)
    process.exit(1)
  }
}
const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}
intializeSeverDatabasae()
app.get('/players/', async (request, response) => {
  const getplayersquery = `
  select 
  * 
  from 
  cricket_team;`
  const getplayers = await db.all(getplayersquery)
  response.send(
    getplayers.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getplayersquery = `
  select 
  * 
  from 
  cricket_team
  where player_id=${playerId};`
  const getplayer = await db.all(getplayersquery)
  response.send(convertDbObjectToResponseObject(getplayer[0]))
})
app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addplayersquery = `insert into cricket_team (player_name,jersey_number,role) values('${playerName}',${jerseyNumber},'${role}')`
  const addplayerresponse = await db.run(addplayersquery)
  const playerId = addplayerresponse.lastID
  console.log(playerId)
  response.send('Player Added to Team')
})
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updateplayerquery = `update cricket_team set player_name='${playerName}',jersey_number=${jerseyNumber},role='${role}' where player_id=${playerId}`
  await db.run(updateplayerquery)
  response.send('Player Details Updated')
})
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deleteplayerquery = `delete from cricket_team where player_id=${playerId}`
  await db.run(deleteplayerquery)
  response.send('Player Removed')
})
module.exports = app
