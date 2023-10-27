const EventCard = ({ event }: EventCardProps) => {
    const { t } = useTranslation();
    const { id, name, description, date, location, image } = event;
    
    return (
        <Link href={`/events/${id}`}>
        <a>
            <
        </a>    
        </Link>
    )
}
export default EventCard;