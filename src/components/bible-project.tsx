import type { BibleBook } from "@/types/bible-book"
import { BookCard } from "./book-card"

interface BibleProjectProps {
  books: BibleBook[]
}

export default function BibleProject({ books }: BibleProjectProps) {
  return (
    <section className="mwg_effect038">
      <div className="pin-height">
        <div className="books_container">
          {books.map((book, index) => (
            <div key={index} className="project">
              <div className="datas">
                <p className="label">{book.name}</p>
                <p className="designer">{book.testament === "OT" ? "Old Testament" : "New Testament"}</p>
              </div>
              <div className="media-container">
                <BookCard book={book} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
