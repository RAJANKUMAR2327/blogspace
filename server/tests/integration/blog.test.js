import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import request from 'supertest'
import { setupTestDB, teardownTestDB, clearTestDB } from './setup.js'

let app, User

beforeAll(async () => {
  await setupTestDB()
  app = (await import('../../app.js')).default
  User = (await import('../../models/User.js')).default
})
afterEach(async () => { await clearTestDB() })
afterAll(async () => { await teardownTestDB() })

async function makeAdmin(email = 'admin@example.com') {
  const res = await request(app).post('/api/auth/register')
    .send({ name: 'Admin', email, password: 'password123' })
  await User.findByIdAndUpdate(res.body.user._id, { role: 'admin' })
  // role changed after the token was issued — re-login to get a token that
  // reflects it, matching how a real admin session would work
  const loginRes = await request(app).post('/api/auth/login').send({ email, password: 'password123' })
  return loginRes.body.token
}

describe('Blog CRUD', () => {
  it('a non-admin cannot create a blog', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ name: 'Regular User', email: 'regular@example.com', password: 'password123' })

    const createRes = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Bearer ${res.body.token}`)
      .send({ title: 'Should Fail', content: 'Nope', category: 'Technology' })

    expect(createRes.status).toBe(403)
  })

  it('an admin can create a blog and it gets a unique slug', async () => {
    const token = await makeAdmin()
    const res = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'My First Post', content: 'Hello world', category: 'Technology', status: 'published' })

    expect(res.status).toBe(201)
    expect(res.body.blog.slug).toMatch(/^my-first-post-\d+$/)
    expect(res.body.blog.status).toBe('published')
  })

  it('a published blog is publicly readable without auth', async () => {
    const token = await makeAdmin()
    const createRes = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Public Post', content: 'Anyone can read this', category: 'Technology', status: 'published' })

    const res = await request(app).get(`/api/blogs/${createRes.body.blog.slug}`)
    expect(res.status).toBe(200)
    expect(res.body.blog.title).toBe('Public Post')
  })

  it('a draft blog is not visible to a non-admin (404, not leaked)', async () => {
    const token = await makeAdmin()
    const createRes = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Secret Draft', content: 'Not ready yet', category: 'Technology', status: 'draft' })

    const res = await request(app).get(`/api/blogs/${createRes.body.blog.slug}`)
    expect(res.status).toBe(404)
  })
})

describe('Follow status on article view (regression test for the bug fixed earlier)', () => {
  it('isFollowing is correctly false for a stranger, true after following', async () => {
    const authorToken = await makeAdmin('author@example.com')
    const createRes = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Bearer ${authorToken}`)
      .send({ title: 'Follow Test Post', content: 'Content', category: 'Technology', status: 'published' })
    const authorId = createRes.body.blog.author

    const readerRes = await request(app).post('/api/auth/register')
      .send({ name: 'Reader', email: 'reader@example.com', password: 'password123' })
    const readerToken = readerRes.body.token

    // Before following — must be false, not undefined/truthy
    const beforeRes = await request(app)
      .get(`/api/blogs/${createRes.body.blog.slug}`)
      .set('Authorization', `Bearer ${readerToken}`)
    expect(beforeRes.body.isFollowing).toBe(false)

    // Follow the author
    await request(app)
      .post(`/api/users/${authorId}/follow`)
      .set('Authorization', `Bearer ${readerToken}`)

    // After following — must now be true
    const afterRes = await request(app)
      .get(`/api/blogs/${createRes.body.blog.slug}`)
      .set('Authorization', `Bearer ${readerToken}`)
    expect(afterRes.body.isFollowing).toBe(true)
  })
})

describe('Comments', () => {
  it('a logged-in user can comment on a published post', async () => {
    const token = await makeAdmin()
    const createRes = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Commentable Post', content: 'Content', category: 'Technology', status: 'published' })

    const res = await request(app)
      .post(`/api/comments/${createRes.body.blog._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Great article!' })

    expect(res.status).toBe(201)
    expect(res.body.comment.content).toBe('Great article!')
  })

  it('rejects a comment with no auth token', async () => {
    const token = await makeAdmin()
    const createRes = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Post', content: 'Content', category: 'Technology', status: 'published' })

    const res = await request(app)
      .post(`/api/comments/${createRes.body.blog._id}`)
      .send({ content: 'Anonymous comment' })

    expect(res.status).toBe(401)
  })
})
