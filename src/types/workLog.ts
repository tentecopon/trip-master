export interface WorkLog {
  id: string
  tripId: string
  date: string // YYYY-MM-DD, logical unique key together with tripId
  startTime: string // HH:mm
  endTime: string // HH:mm, '' when not yet ended
  updatedAt: string
}
