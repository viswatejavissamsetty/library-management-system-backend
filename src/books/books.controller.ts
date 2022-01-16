import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Book, BooksService } from './books.service';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @UseGuards(JwtAuthGuard)
  @Get('all-books')
  async getAllBooks() {
    return this.booksService.getAllBooks();
  }

  @UseGuards(JwtAuthGuard)
  @Get('book')
  async getBook(@Query() bookId: string) {
    return this.booksService.getBook(bookId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('new-book')
  async createNewBook(@Body() bookData: Book) {
    try {
      return this.booksService.create(bookData);
    } catch (error) {}
  }
}
