import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { BooksController } from './books.controller';
import { booksProvider } from './books.providers';
import { BooksService } from './books.service';

@Module({
  imports: [DatabaseModule],
  controllers: [BooksController],
  providers: [BooksService, ...booksProvider],
  exports: [BooksService],
})
export class BooksModule {}
