import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';



// This matches your file layout and dynamically appends the JWT from localStorage on every outbound request.

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

// Middleware link injecting Auth headers
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('gym_auth_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});