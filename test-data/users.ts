import 'dotenv/config';

export const USERS = {
  admin: {
    username: process.env.IGM_ADMIN_USERNAME!,
    password: process.env.IGM_ADMIN_PASSWORD!
  }
};