import * as mongoose from 'mongoose';

const databaseDetails = {
  username: 'viswa',
  password: 'viswa123',
  databaseName: 'library-management-system',
  cluster: 'n6vlu',
};

const connectionString = `mongodb+srv://${databaseDetails.username}:${databaseDetails.password}@cluster0.${databaseDetails.cluster}.mongodb.net/${databaseDetails.databaseName}?retryWrites=true&w=majority`;

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect(connectionString),
  },
];
