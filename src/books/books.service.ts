import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { unlinkSync } from 'fs';
import { Model, UpdateWriteOpResult } from 'mongoose';
import { CreateBookDto as BookDto } from 'src/types/create-book';

export type Book = {
  readonly _id: string;
  // readonly bookId: string;
  bookTitle: string;
  bookDescription: string;
  authorName: string;
  authorDescription: string;
  imagePath: string;
  price: number;
  fine: number;
  totalNumberOfBooks: number;
  availableNumberOfBooks: number;
  ratings: number;
  category: string;
};

@Injectable()
export class BooksService {
  constructor(@Inject('BOOK_MODEL') private bookModel: Model<Book>) {}

  async getAllBooks(): Promise<BookDto[]> {
    return this.bookModel.find({}).exec();
  }

  async getBook(id: string): Promise<BookDto> {
    return this.bookModel.findById(id).exec();
  }

  async create(bookData: Book): Promise<BookDto> {
    const book = await this.bookModel.findOne({
      authorName: bookData.authorName,
      bookTitle: bookData.bookTitle,
    });
    if (!book) {
      try {
        bookData.availableNumberOfBooks = bookData.totalNumberOfBooks;
        const createdBook = new this.bookModel(bookData);
        const data = await createdBook.save();
        return data;
      } catch (error) {
        unlinkSync('public/' + bookData.imagePath);
        throw new HttpException('Invalid Data', HttpStatus.FORBIDDEN);
      }
    } else {
      unlinkSync('public/' + bookData.imagePath);
      throw new HttpException('Book Already Exist', HttpStatus.CONFLICT);
    }
  }

  async updateBookCount(
    id: string,
    count: 1 | -1,
  ): Promise<UpdateWriteOpResult | null> {
    const book = await this.getBook(id);
    if (
      count == 1
        ? book.availableNumberOfBooks < book.totalNumberOfBooks
        : book.availableNumberOfBooks > 0
    ) {
      return this.bookModel.updateOne(
        { _id: id },
        { $inc: { availableNumberOfBooks: count } },
      );
    } else {
      return null;
    }
  }
}
