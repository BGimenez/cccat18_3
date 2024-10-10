import DatabaseConnection from "../database/DatabaseConnection";
import { inject } from "../di/DI";
import Ride from "../../domain/Ride";

export default interface RideRepository {
	saveRide (ride: Ride): Promise<void>;
	getRideById (rideId: string): Promise<Ride>;
	updateRide (ride: Ride): Promise<void>;
	getRidesByDriver (driverId: string): Promise<Ride[]>;
}

export class RideRepositoryDatabase implements RideRepository {
	@inject("databaseConnection")
	connection?: DatabaseConnection;

	async saveRide(ride: Ride): Promise<void> {
		await this.connection?.query("insert into ccca.ride (ride_id, passenger_id, from_lat, from_long, to_lat, to_long, status, date) values ($1, $2, $3, $4, $5, $6, $7, $8)", [ride.getRideId(), ride.getPassengerId(), ride.getFrom().getLat(), ride.getFrom().getLong(), ride.getTo().getLat(), ride.getTo().getLong(), ride.getStatus(), ride.getDate()]);
	}

	async getRideById(rideId: string): Promise<Ride> {
		const [rideData] = await this.connection?.query("select * from ccca.ride where ride_id = $1", [rideId]);
		if (!rideData) throw new Error("Ride not found");
		return new Ride(rideData.ride_id, rideData.passenger_id, parseFloat(rideData.from_lat), parseFloat(rideData.from_long), parseFloat(rideData.to_lat), parseFloat(rideData.to_long), rideData.status, rideData.date, rideData.driver_id);
	}

	async updateRide(ride: Ride): Promise<void> {
		await this.connection?.query("update ccca.ride set driver_id = $1, status = $2 where ride_id = $3", [ride.getDriverId(), ride.getStatus(), ride.getRideId()]);
	}

	async getRidesByDriver(driverId: string): Promise<Ride[]> {
		let rides: any[] = [];
		rides = await this.connection?.query("select * from ccca.ride where driver_id = $1", [driverId]);
		return rides?.map(ride => new Ride(ride.ride_id, ride.passenger_id, parseFloat(ride.from_lat), parseFloat(ride.from_long), parseFloat(ride.to_lat), parseFloat(ride.to_long), ride.status, ride.date, ride.driver_id));
	}
}
