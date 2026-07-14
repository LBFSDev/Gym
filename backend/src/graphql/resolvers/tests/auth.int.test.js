import request from 'supertest';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import http from 'http';
import knex from '../../../config/db.js';
import { typeDefs  } from '../../types/typeDefs.js';
import { resolvers} from '../../resolvers/resolvers.js';
import { getContext } from '../../../app';


describe('Authentication Flow Integration Tests', () => {
  let app, server, httpServer;

  beforeAll(async () => {
    app = express();
    httpServer = http.createServer(app);
    server = new ApolloServer({
      typeDefs: typeDefs,
      resolvers: resolvers,
    });
    await server.start();
    
    app.use(
      '/graphql',
      express.json(),
      expressMiddleware(server, { context: getContext })
    );

    // Run pending migrations to setup test schema
    await knex.migrate.latest();
  });

  afterAll(async () => {
    await server.stop();
    await httpServer.close();
    await knex.destroy();
  });

  beforeEach(async () => {
    // Keep clean test state
    await knex('users').del();
  });

  it('should block unauthenticated queries on "me"', async () => {
    const res = await request(app)
      .post('/graphql')
      .send({
        query: `query { me { id email } }`,
      });

    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });

  it('should successfully register a new customer', async () => {
    const res = await request(app)
      .post('/graphql')
      .send({
        query: `
          mutation {
            register(email: "test@ironworld.com", password: "Password123", name: "John Doe") {
              token
              user {
                name
                role
              }
            }
          }
        `,
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.register.token).toBeDefined();
    expect(res.body.data.register.user.role).toBe('CUSTOMER');
  });
});