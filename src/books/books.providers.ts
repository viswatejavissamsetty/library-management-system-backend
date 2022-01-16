import { Connection } from 'mongoose';
import { BookSchema } from 'src/schemas/book.schema';

export const booksProvider = [
  {
    provide: 'BOOK_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Books', BookSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
