import Coord from "./Coord";
import UUID from "./UUID";

export default class Position {
	private positionId: UUID;
	private rideId: UUID;
	private coord: Coord;
	private date: Date;

	constructor (positionId: string, rideId: string, lat: number, long: number, date: Date) {
		this.positionId = new UUID(positionId);
		this.rideId = new UUID(rideId);
		this.coord = new Coord(lat, long);
		this.date = date;
	}

	static create (rideId: string, lat: number, long: number) {
		const uuid = UUID.create();
		const date = new Date();
		return new Position(uuid.getValue(), rideId, lat, long, date);
	}

	getPositionId () {
		return this.positionId.getValue();
	}

	getRideId () {
		return this.rideId.getValue();
	}
	
	getCoord () {
		return this.coord;
	}

	getDate () {
		return this.date;
	}

}
