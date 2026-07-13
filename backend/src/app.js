// src/app.js
import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import  { startStandaloneServer }  from '@apollo/server/standalone';
import  typeDefs  from './graphql/schema/schema.js';
import  resolvers  from './graphql/resolvers/resolvers.js';
import  db  from './config/db.js'; // Your Knex connection instance

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function startServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    // Inject db connection here so it's globally accessible in resolvers
    context: async ({ req }) => {
      // You can also handle JWT user authentication here!
      try{
      return { db };
      }catch(err){
        console.log(err);
      }
    },
  });

  

  console.log(`🚀 Gym GraphQL Server ready at ${url}`);
}

startServer();