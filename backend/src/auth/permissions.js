import { GraphQLError } from 'graphql';

export const requireAuth = (context) => {
  if (!context.currentUser) {
    throw new GraphQLError('Authentication required.', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return context.currentUser;
};

export const requireRoles = (context, allowedRoles = []) => {
  const user = requireAuth(context);
  if (!allowedRoles.includes(user.role)) {
    throw new GraphQLError('Access denied. You do not have the required permissions.', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
  return user;
};