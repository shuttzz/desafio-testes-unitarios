const secret = process.env.JWT_SECRET as string;

export default {
  jwt: {
    secret,
    expiresIn: "1d",
  },
};
