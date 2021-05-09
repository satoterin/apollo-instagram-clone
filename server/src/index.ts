import 'reflect-metadata';
import 'colors';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createConnection } from 'typeorm';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { graphqlUploadExpress } from 'graphql-upload';
import cookieParser from 'cookie-parser';
import { __prod__ } from './constants';
import { createUserLoader } from './utils/createUserLoader';
import { createProfileLoader } from './utils/createProfileLoader';

const main = async () => {
  await createConnection();

  const app = express();

  app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
    })
  );

  app.get('/', (_, res) => res.send('Welcome to Apollo Instagram API'));

  app.use(cookieParser());

  app.use('/', express.static('public'));
  app.use(graphqlUploadExpress({ maxFileSize: 100000000, maxFiles: 10 }));

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [`${__dirname}/resolvers/**/*.{ts,js}`],
    }),
    context: ({ req, res }) => ({
      req,
      res,
      userLoader: createUserLoader(),
      profileLoader: createProfileLoader(),
    }),
    uploads: false,
  });

  apolloServer.applyMiddleware({ app, cors: false });

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(
      `Graph API is running at http://localhost:${PORT}${apolloServer.graphqlPath}`
        .blue.bold
    );
  });
};

main().catch((err) => console.log('Root Error: ', err));
