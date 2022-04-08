import { User } from '@src/models/user';
import { compare, hash } from 'bcrypt';
import config from 'config';
import { sign, verify } from 'jsonwebtoken';

export interface DecodedUser extends Omit<User, '_id'> {
  id: string;
}

export default class AuthService {
  static async hashPassword(password: string, salt = 10): Promise<string> {
    return hash(password, salt);
  }

  static async comparePasswords(password: string, hashPassword: string): Promise<boolean> {
    return compare(password, hashPassword);
  }

  static generateToken(payload: object): string {
    return sign(payload, config.get('App.auth.key'), {
      expiresIn: config.get('App.auth.tokenExpiresIn'),
    });
  }

  static decodeToken(token: string): DecodedUser {
    return verify(token, config.get('App.auth.key')) as DecodedUser;
  }
}
