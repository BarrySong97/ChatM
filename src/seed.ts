import { BookService } from "./api/services/BookService";

export async function seed() {
  const books = await BookService.listBooks();
  if (!books.length) {
    await BookService.createBook({
      name: "默认账本",
      isDefault: 1,
      isCurrent: 1,
    });
  }
}
