import * as mongoose from 'mongoose';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect('mongodb+srv://venu:Kingrockz@cluster0.vgpzt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority/library-management-system'),
  },
];
