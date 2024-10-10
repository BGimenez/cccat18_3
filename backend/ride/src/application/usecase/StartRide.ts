import AccountRepository from "../../infra/repository/AccountRepository";
import { inject } from "../../infra/di/DI";
import RideRepository from "../../infra/repository/RideRepository";


export default class StartRide {
	@inject("accountRepository")
	accountRepository?: AccountRepository;
	@inject("rideRepository")
	rideRepository?: RideRepository;

	async execute (input: Input): Promise<void> {
		const ride = await this.rideRepository?.getRideById(input.rideId);
		if (!ride) throw new Error("Ride not found!");
		if (ride.getStatus() !== "accepted") throw new Error("Ride is not accepted")
		ride.start();
		await this.rideRepository?.updateRide(ride);
	}
}

type Input = {
	rideId: string,
}

