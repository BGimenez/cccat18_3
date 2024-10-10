import Position from "../../domain/Position";
import DatabaseConnection from "../database/DatabaseConnection";
import { inject } from "../di/DI";

export default interface PositionRepository {
	savePosition (position: Position): Promise<void>;
	getPositionByRideId (rideId: string): Promise<Position[]>;
}

export class PositionRepositoryDatabase implements PositionRepository {
	@inject("databaseConnection")
	connection?: DatabaseConnection;

	async savePosition(position: Position): Promise<void> {
		await this.connection?.query("insert into ccca.position (position_id, ride_id, lat, long, date) values ($1, $2, $3, $4, $5)", [position.getPositionId(), position.getRideId(), position.getCoord().getLat(), position.getCoord().getLong(), position.getDate()]);
	}

	async getPositionByRideId(rideId: string): Promise<Position[]> {
		let positions: any[] = [];
		positions = await this.connection?.query("select * from ccca.position where ride_id = $1", [rideId]);
		return positions?.map(position => new Position(position.position_id, position.ride_id, parseFloat(position.lat), parseFloat(position.long), position.date));
	}
}
