import Position from "../../domain/Position";
import { inject } from "../../infra/di/DI";
import PositionRepository from "../../infra/repository/PositionRepository";
import RideRepository from "../../infra/repository/RideRepository";

export default class UpdatePosition {
	@inject("rideRepository")
	rideRepository?: RideRepository;
	@inject("positionRepository")
	positionRepository?: PositionRepository;

	async execute (input: Input): Promise<void> {
		const ride = await this.rideRepository?.getRideById(input.rideId);
		if (!ride) throw new Error("Ride not found!");
		if (ride.getStatus() !== "in_progress") throw new Error("Ride status must be 'in progress'");
		const position = Position.create(input.rideId, input.lat, input.long);
		await this.positionRepository?.savePosition(position);
	}
}

type Input = {
	rideId: string,
	lat: number,
	long: number,
}

