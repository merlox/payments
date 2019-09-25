const MongoClient = require('mongodb').MongoClient

function connectToDatabase (mongoUrl) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(mongoUrl, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }, (err, client) => {
      if (err) return reject(err)
      const database = client.db('payments')
      client.close()
      console.log('Connected to the mongo database')
      resolve(database)
    })
  })
}

module.exports = connectToDatabase
