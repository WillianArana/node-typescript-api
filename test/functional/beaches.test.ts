import { Beach } from '@src/models/beach';
import { User } from '@src/models/user';
import AuthService from '@src/services/auth';

describe('Beache functional tests', () => {
  const defaultUser = {
    name: 'John Doe',
    email: 'john2@mail.com',
    password: '123',
  };

  let token: string;

  beforeAll(async () => {
    await Beach.deleteMany({});
  });

  beforeEach(async () => {
    await Beach.deleteMany({});
    await User.deleteMany({});
    const user = await new User(defaultUser).save();
    token = AuthService.generateToken(user.toJSON());
  });

  describe('When createing a new beach', () => {
    it('should create a beach with success', async () => {
      const newBeach = {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
      };

      const response = await global.testRequest
        .post('/beaches')
        .set({
          'x-access-token': token,
        })
        .send(newBeach);
      expect(response.status).toBe(201);
      //Object containing matches the keys and values, even if includes other keys such as id.
      expect(response.body).toEqual(expect.objectContaining(newBeach));
    });

    it('should return validation error when a field is invalid', async () => {
      const newBeach = {
        lat: 'invalid_string',
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
      };
      const response = await global.testRequest
        .post('/beaches')
        .set({
          'x-access-token': token,
        })
        .send(newBeach);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: 400,
        error: 'Bad Request',
        message:
          'Beach validation failed: lat: Cast to Number failed for value "invalid_string" (type string) at path "lat"',
      });
    });

    it('should return 500 when there is any error other than validation error', async () => {
      jest.spyOn(Beach.prototype, 'save').mockRejectedValueOnce('fail to create beach');

      const newBeach = {
        lat: 'invalid_string',
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
      };

      const response = await global.testRequest
        .post('/beaches')
        .set({
          'x-access-token': token,
        })
        .send(newBeach);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        code: 500,
        message: 'Something went wrong!',
      });
    });
  });
});
