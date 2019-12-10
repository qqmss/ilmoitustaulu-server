const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Event = require('../models/event')

const api = supertest(app)

const events = [
  {
    participants: 124,
    name: "Konsertti 1",
    location: "Oulu",
    time: "1995-12-17T22:00:00.000Z",
    description: "laulua"
  },
  {
    participants: 1005,
    name: "Konsertti 2",
    location: "Vaasa",
    time: "1995-12-18T23:00:00.000Z",
    description: "musiikkia"
  },
  {
    participants: 10,
    name: "Kävely",
    location: "kuu",
    time: "1995-12-20T20:30:00.000Z",
    description: "ei ilmaa"
  }
]

beforeAll(async () => {
  await Event.deleteMany({})
  await Event.insertMany(events)
})

describe('tapahtuma rest api:n testaus', () => {

  test('tapahtumat palautetaan json muodossa', async () => {
    const response = await api.get('/api/events')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    expect(response.body.length).toBe(events.length)
  })

  test('tapahtuma saa id:n', async () => {
    const response = await api.get('/api/events')
    expect(response.body[0].id).toBeDefined()
  })

  test('tapahtuma saa luomisajan', async () => {
    const response = await api.get('/api/events')
    expect(response.body[0].createdTime).toBeDefined()
  })

  test('validi tapahtuma voidaan lisätä', async () => {
    const newEvent = {
      name: "uinti",
      location: "Oulu",
      time: "2020-12-17T22:00:00.000Z",
      description: "vesi"
    }
    const responseSavedEvent = await api.post('/api/events')
      .send(newEvent)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const responseEvents = await api.get('/api/events')
    expect(responseEvents.body.length).toBe(events.length + 1)

    const responseEvent = await api.get(`/api/events/${responseSavedEvent.body.id}`)
    expect(responseEvent.body).toEqual(responseSavedEvent.body)
  })

  describe('ei validia tapahtumaa ei voi lisätä', () => {

    test('puuttuu nimi', async () => {
      const newEvent = {
        name: "",
        location: "Oulu",
        time: "2020-12-17T22:00:00.000Z",
        description: "vesi"
      }
      const responseStart = await api.get('/api/events')
      await api.post('/api/events')
        .send(newEvent)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const responseEnd = await api.get('/api/events')
      expect(responseEnd.body).toEqual(responseStart.body)
    })

    test('puuttuu paikka', async () => {
      const newEvent = {
        name: "uinti",
        location: "",
        time: "2020-12-17T22:00:00.000Z",
        description: "vesi"
      }
      const responseStart = await api.get('/api/events')
      await api.post('/api/events')
        .send(newEvent)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const responseEnd = await api.get('/api/events')
      expect(responseEnd.body).toEqual(responseStart.body)
    })

    test('puuttuu kuvaus', async () => {
      const newEvent = {
        name: "uinti",
        location: "Oulu",
        time: "2020-12-17T22:00:00.000Z",
        description: ""
      }
      const responseStart = await api.get('/api/events')
      await api.post('/api/events')
        .send(newEvent)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const responseEnd = await api.get('/api/events')
      expect(responseEnd.body).toEqual(responseStart.body)
    })

    test('aika ei ole validi', async () => {
      const newEvent = {
        name: "uinti",
        location: "Oulu",
        time: "aamulla",
        description: "vesi"
      }
      const responseStart = await api.get('/api/events')
      await api.post('/api/events')
        .send(newEvent)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const responseEnd = await api.get('/api/events')
      expect(responseEnd.body).toEqual(responseStart.body)
    })

  })

  test('tapahtuman poistaminen', async () => {

    const responceStart = await api
      .get('/api/events')
    await api
      .delete(`/api/events/${responceStart.body[0].id}`)
      .expect(204)
    const responseEnd = await api
      .get('/api/events')

    expect(responseEnd.body.length).toBe(responceStart.body.length - 1)
  })

  test('jos tapahtuman osallistujien määrää ei määritetä saa se oletusarvon 0', async () => {
    const newEvent = {
      name: "uinti",
      location: "Oulu",
      time: "2020-12-17T22:00:00.000Z",
      description: "märkä"
    }

    const responcePostedEvent = await api
      .post('/api/events')
      .send(newEvent)

    const responseEvent = await api
      .get(`/api/events/${responcePostedEvent.body.id}`)

    expect(responseEvent.body.participants).toBe(0)
  })

  test('tapahtuman osallistujien määrää ei < 0', async () => {
    const newEvent = {
      participants: -1,
      name: "uinti",
      location: "Oulu",
      time: "2020-12-17T22:00:00.000Z",
      description: "märkä"
    }
    await api
      .post('/api/events')
      .send(newEvent)
      .expect(400)
  })

  test('tapahtuman muuttaminen', async () => {
    const responceStart = await api.get('/api/events')
    const participantsStart = responceStart.body[0].participants
    const event = responceStart.body[0]
    ++event.participants
    const updatedEvent = await api
      .put(`/api/events/${event.id}`).send(event)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    expect(updatedEvent.body.participants).toBe(participantsStart + 1)
  })


})


afterAll(() => {
  mongoose.connection.close()
})