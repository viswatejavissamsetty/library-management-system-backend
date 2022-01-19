import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model, UpdateWriteOpResult } from 'mongoose';
import { BooksService } from 'src/books/books.service';
import { CreateBookOrderDto as BookOrderDto } from 'src/types/create-book-order';
import { UsersService } from 'src/users/users.service';

const checkTime = 60 * 60 * 24 * 2; // sec * min * hours * days

export type BookOrder = {
  readonly _id: string;
  userId: string;
  bookId: string;
  planedDate: Date;
  takenDate: Date | string;
  returnedDate: Date | string;
  status: string;
  fine: number;
  issuer: string;
};

@Injectable()
export class BookOrdersService {
  constructor(
    @Inject('BOOK_ORDER_MODEL') private bookOrderModel: Model<BookOrder>,
    private userService: UsersService,
    private bookService: BooksService,
  ) {}

  async getAllPlannedBooks(): Promise<BookOrderDto[]> {
    return this.bookOrderModel.find({ status: 'PLANNED' });
  }

  async getAllTakenBooks(): Promise<BookOrderDto[]> {
    return this.bookOrderModel.find({ status: 'TAKEN' });
  }

  async getAllReturnedBooks(): Promise<BookOrderDto[]> {
    return this.bookOrderModel.find({ status: 'RETURNED' });
  }

  async planToTakeBook(newData: BookOrder) {
    const bookDetails = await this.bookService.getBook(newData.bookId);
    newData.planedDate = new Date();
    newData.takenDate = new Date(0);
    newData.returnedDate = new Date(0);
    newData.status = 'PLANNED';
    newData.fine = bookDetails.fine;
    const createNewBookData = new this.bookOrderModel(newData);
    const data = await createNewBookData.save();
    await this.bookService.updateBookCount(newData.bookId, -1);
    return data;
  }

  async returnBook(
    userId: string,
    bookId: string,
    issuer: string,
  ): Promise<UpdateWriteOpResult> {
    const issuerDetails = await this.userService.findOne(issuer);
    if (issuerDetails.isLibrarian) {
      const data = await this.bookOrderModel.updateOne(
        { userId, bookId, issuer },
        { status: 'RETURNED' },
      );
      if (data) {
        await this.bookService.updateBookCount(bookId, 1);
        return data;
      }
    } else {
      throw new HttpException('Invalid User', HttpStatus.FORBIDDEN);
    }
  }

  async cancelBook(bookData: BookOrder) {
    bookData.planedDate = new Date();
    bookData.takenDate = '';
    bookData.returnedDate = '';
    bookData.status = 'CANCELLED';
    await this.bookService.updateBookCount(bookData.bookId, 1);
    const cancelBookStatus = await this.bookOrderModel.updateOne(
      {
        bookId: bookData.bookId,
        userId: bookData.userId,
        status: 'PLANNED',
      },
      { status: 'CANCELLED' },
    );
    return cancelBookStatus;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    console.log('Runnning Cron Job');
    const plannedBooks = await this.getAllPlannedBooks();
    plannedBooks.forEach((book) => {
      const date1 = new Date(book.planedDate);
      const date2 = new Date();
      if (date2.getTime() - date1.getTime() >= checkTime) {
        this.cancelBook(book);
      }
    });
  }
}
