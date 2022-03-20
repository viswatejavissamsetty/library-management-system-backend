import * as mongoose from 'mongoose';

const databaseDetails = {
  username: 'venu',
  password: 'Kingrockz',
  databaseName: 'library-management-system',
  cluster: 'vgpzt',
};

// console.log(databaseDetails);

const connectionString = `mongodb+srv://${databaseDetails.username}:${databaseDetails.password}@cluster0.${databaseDetails.cluster}.mongodb.net/${databaseDetails.databaseName}?retryWrites=true&w=majority`;

console.log(connectionString);

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect(connectionString),
  },
];
