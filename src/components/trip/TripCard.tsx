import { Link } from 'react-router-dom'
import type { Trip } from '@/types/trip'
import { getTripPhaseOf } from '@/services/tripService'
import { formatDateJp } from '@/utils/date'
import { TripPhaseBadge } from './TripBadges'

export function TripCard({ trip }: { trip: Trip }) {
  const phase = getTripPhaseOf(trip)
  return (
    <Link to={`/trips/${trip.id}`} className="trip-card">
      <div className="trip-card-top">
        <span className="trip-card-machine">{trip.machineName}</span>
        <TripPhaseBadge phase={phase} />
      </div>
      <div className="trip-card-location">{trip.location}</div>
      <div className="trip-card-dates">
        {formatDateJp(trip.startDate)} 〜 {formatDateJp(trip.endDate)}
      </div>
      {trip.purposeName && <div className="trip-card-purpose">{trip.purposeName}</div>}
    </Link>
  )
}
