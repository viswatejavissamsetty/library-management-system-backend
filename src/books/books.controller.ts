import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
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
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = 'public/images/' + req.body.category;
          // Create folder if doesn't exist
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath);
          }
          cb(null, uploadPath + '/');
        },
        filename: (req: any, file: any, cb: any) => {
          // Calling the callback passing the random name generated with the original name
          cb(
            null,
            `${file.originalname.split('.')[0]}${new Date().getTime()}${extname(
              file.originalname,
            )}`,
          );
        },
      }),
    }),
  )
  async createNewBook(
    @UploadedFile() file: Express.Multer.File,
    @Body() bookData: Book,
  ) {
    bookData.imagePath = (file.destination + file.filename).slice(7);
    return this.booksService.create(bookData);
  }
}
