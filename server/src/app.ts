import http from 'http';
import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { buildSchema } from 'type-graphql';
import { graphqlUploadExpress } from 'graphql-upload';
import cookieParser from 'cookie-parser';
import { createUserLoader } from './utils/createUserLoader';
import { createProfileLoader } from './utils/createProfileLoader';
import { FRONTEND_URL } from './constants';

async function createServer() {
  const app = express();

  const httpServer = http.createServer(app);

  app.use(
    cors({
      origin: FRONTEND_URL,
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
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, cors: false });
  return { server: httpServer };
}

export default createServer;
