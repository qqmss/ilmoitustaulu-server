const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Comment = require('../models/comment')
const Event = require('../models/event')

const api = supertest(app)

const comments = [
  {
    author: "fre",
    message: "kiva"
  },
  {
    author: "gos",
    message: "kiva joo"
  },
  {
    author: "aone",
    message: "märkä lattia"
  }
]
let eventId = 0

beforeAll(async () => {
  const event = new Event({
    participants: 10,
    name: "Kävely",
    location: "kuu",
    time: "1995-12-20T20:30:00.000Z",
    description: "ei ilmaa"
  })
  const savedEvent = await event.save()
  eventId = savedEvent.id
  console.log('hello', eventId)
  await Comment.deleteMany({})
  await Comment.insertMany(comments.map(comment => { comment.eventId = eventId; return comment })
  )
})


describe('tapahtuma rest api:n kommenttien testaus', () => {

  test('kommentit palautetaan json muodossa', async () => {
    const response = await api.get(`/api/events/${eventId}/comments`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    expect(response.body.length).toBe(comments.length)
  })

  test('kommentti saa id:n', async () => {
    const response = await api.get(`/api/events/${eventId}/comments`)
    expect(response.body[0].id).toBeDefined()
  })

  test('kommentti saa luomisajan', async () => {
    const response = await api.get(`/api/events/${eventId}/comments`)
    expect(response.body[0].createdTime).toBeDefined()
  })

  test('validi kommentti voidaan lisätä', async () => {
    const newComment = {
      author: "Vallius",
      message: "validia"
    }
    const responseSavedComment = await api.post(`/api/events/${eventId}/comments`)
      .send(newComment)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const responseComments = await api.get(`/api/events/${eventId}/comments`)
    expect(responseComments.body.length).toBe(comments.length + 1)

    const responseComment = await api.get(`/api/events/${eventId}/comments/${responseSavedComment.body.id}`)
    expect(responseComment.body).toEqual(responseSavedComment.body)
  })

  describe('ei validia kommenttia ei voi lisätä', () => {

    test('puutuu nimimerkki', async () => {
      const newComment = {
        author: "",
        message: "hues"
      }
      const responseStart = await api.get(`/api/events/${eventId}/comments`)
      await api.post(`/api/events/${eventId}/comments`)
        .send(newComment)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const responseEnd = await api.get(`/api/events/${eventId}/comments`)
      expect(responseEnd.body).toEqual(responseStart.body)
    })

    test('puutuu viesti', async () => {
      const newComment = {
        author: "Hyrra",
        message: ""
      }
      const responseStart = await api.get(`/api/events/${eventId}/comments`)
      await api.post(`/api/events/${eventId}/comments`)
        .send(newComment)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const responseEnd = await api.get(`/api/events/${eventId}/comments`)
      expect(responseEnd.body).toEqual(responseStart.body)
    })

  })

  test('kommentin poistaminen', async () => {

    const responceStart = await api
      .get(`/api/events/${eventId}/comments`)
    await api
      .delete(`/api/events/${eventId}/comments/${responceStart.body[0].id}`)
      .expect(204)
    const responseEnd = await api
      .get(`/api/events/${eventId}/comments`)

    expect(responseEnd.body.length).toBe(responceStart.body.length - 1)
  })

  test.skip('kommentin muuttaminen', async () => {
    const responceStart = await api.get(`/api/events/${eventId}/comments`)
    const messageStart = responceStart.body[0].message
    const comment = responceStart.body[0]
    comment.message = 'muutin viestiä'
    const updatedComment = await api
      .put(`/api/events/${eventId}/comments/${comment.id}`).send(comment)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    expect(updatedComment.body.message).toBe(message)
    const reGotComment = await api
      .get(`/api/events/${eventId}/comments/${comment.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    expect(reGotComment.body.message).not.toBe(messageStart)
  })

  test('Poistetulla tapahtumalla ei ole kommentteja', async () => {
    await api.delete(`/api/events/${eventId}`).expect(204)
    eventExits = await Event.exists({ _id: eventId })
    expect(eventExits).toBe(false)
    await api.get(`/api/events/${eventId}/comments/`).expect(404)
    const foundComments = await Comment.find({ eventId: eventId })
    expect(foundComments.length).toBe(0)
  })

  test('Poistetulle tapahtumalle ei voi lisätä kommentteja', async () => {
    const newComment = {
      author: "Fgr",
      message: "poistetulle"
    }
    await api.delete(`/api/events/${eventId}`).expect(204)
    await api.post(`/api/events/${eventId}/comments`)
      .send(newComment)
      .expect(404)
      .expect('Content-Type', /application\/json/)
  })


})


afterAll(() => {
  mongoose.connection.close()
})