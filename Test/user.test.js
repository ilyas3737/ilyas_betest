process.env.ISDEV = "false";
process.env.TEST = "true";
const request = require('supertest');
const app = require('../app'); 
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const { mockUserData } = require('../mocks/mockData');

jest.mock('../models/User', () => ({
    create: jest.fn(),
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOne: jest.fn(),
    findOneAndDelete: jest.fn()
}));

describe('User API endpoints', () => {
  let token;
  let server;

  beforeAll(done => {
    server = app.listen(4000, () => {
      console.log('server running || port : 4000');
      done();
    });
  });

  afterAll(done => {
    server.close(done);
  });

  it('should return a token', async () => {
    const response = await request(app)
      .post('/api/user/gettoken')
      .send({ username: 'admin', password: 'admin' });
    token = response.body.token;
  });

  it('should create a new user', async () => {

    const datas = mockUserData[0];

    User.create.mockResolvedValue(datas);

    const response = await request(app)
      .post('/api/user')
      .set('Authorization', `Bearer ${token}`)
      .send(datas);

    console.log(response.body);
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual(datas);
  });

  it('should get all users', async () => {
    User.find.mockResolvedValue(mockUserData);

    const response = await request(app)
      .get('/api/user')
      .set('Authorization', `Bearer ${token}`);
    
    console.log(response.body);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockUserData);
  });

  it('should update a user', async () => {

    const updatedUserData = { ...mockUserData[0], userName: 'Update Name' };
    User.findOneAndUpdate.mockResolvedValue(updatedUserData);

    const response = await request(app)
      .put(`/api/user/${mockUserData[0].id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedUserData);

    console.log(response.body);
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual(updatedUserData);
  });

  it('should get user by ID', async () => {
    User.findOne.mockResolvedValue(mockUserData[0]);

    const response = await request(app)
      .get(`/api/user/${mockUserData[0].id}`)
      .set('Authorization', `Bearer ${token}`);

    console.log(response.body)
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockUserData[0]);
  });

  it('should get user by Account Number', async () => {
    User.findOne.mockResolvedValue(mockUserData[0]);

    const response = await request(app)
      .get(`/api/user/${mockUserData[0].accountNumber}`)
      .set('Authorization', `Bearer ${token}`);

    console.log(response.body)
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockUserData[0]);
  });
  it('should get user by Identity Number', async () => {
    User.findOne.mockResolvedValue(mockUserData[0]);

    const response = await request(app)
      .get(`/api/user/${mockUserData[0].identityNumber}`)
      .set('Authorization', `Bearer ${token}`);

    console.log(response.body)
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockUserData[0]);
  });

  it('should delete a user', async () => {
    User.findOneAndDelete.mockResolvedValue(mockUserData[0]);

    const response = await request(app)
      .delete(`/api/user/${mockUserData[0].id}`)
      .set('Authorization', `Bearer ${token}`);
    
    console.log(response.body)
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockUserData[0]);
  });
});
