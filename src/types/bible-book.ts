export interface BibleBook {
  id: string
  name: string
  testament: "OT" | "NT"
  chapters: number
  image: string
}
