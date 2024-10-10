import Position from "../../domain/Position";
import { inject } from "../../infra/di/DI";
import PositionRepository from "../../infra/repository/PositionRepository";
import RideRepository from "../../infra/repository/RideRepository";

export default class GetRide {
	@inject("rideRepository")
	rideRepository?: RideRepository;
	@inject("positionRepository")
	positionRepository?: PositionRepository;

	async execute (rideId: string): Promise<Output> {
		const ride = await this.rideRepository?.getRideById(rideId);
		if (!ride) throw new Error("Ride not found");
		const positions = await this.positionRepository?.getPositionByRideId(rideId);
		return {
			rideId: ride.getRideId(),
			passengerId: ride.getPassengerId(),
			driverId: ride.getDriverId(),
			fromLat: ride.getFrom().getLat(),
			fromLong: ride.getFrom().getLong(),
			toLat: ride.getTo().getLat(),
			toLong: ride.getTo().getLong(),
			status: ride.getStatus(),
			positions: positions || []
		}		
	}
}

type Output = {
	rideId: string,
	passengerId: string,
	driverId?: string,
	fromLat: number,
	fromLong: number,
	toLat: number,
	toLong: number,
	status: string,
	positions: Position[]
}
