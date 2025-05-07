import type { BibleBook } from "@/types/bible-book"
import { BookCard } from "./book-card"
import Link from 'next/link'

interface BibleProjectProps {
  books: BibleBook[]
}

export default function BibleProject({ books }: BibleProjectProps) {
  return (
    <section className="mwg_effect038 relative w-full">
      <div className="pin-height relative w-full">
        <div className="books_container flex w-full">
          {books.map((book) => {
            const bookSlug = book.name.toLowerCase().replace(/\s+/g, '-');
            return (
              <div key={book.id} className="project min-w-[100vw] flex-shrink-0">
                <div className="datas">
                    <p className="label">{book.name}</p>
                  <p className="designer">{book.testament === "OT" ? "Old Testament" : "New Testament"}</p>
                </div>
                <div className="media-container">
                  <BookCard book={book} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  )
}
