import AccountRepository from "../../infra/repository/AccountRepository";
import { inject } from "../../infra/di/DI";
import Ride from "../../domain/Ride";
import RideRepository from "../../infra/repository/RideRepository";


export default class RequestRide {
	@inject("accountRepository")
	accountRepository?: AccountRepository;
	@inject("rideRepository")
	rideRepository?: RideRepository;

	async execute (input: Input): Promise<void> {
		const account = await this.accountRepository?.getAccountById(input.driverId);
		if (!account) throw new Error("Account does not exist");
		if (!account.isDriver) throw new Error("Account must be from a driver");
		const accountRides = await this.rideRepository?.getRidesByDriver(input.driverId);
		const ride = await this.rideRepository?.getRideById(input.rideId);
		if (!ride) throw new Error("Ride not found!");
		if (ride.getStatus() != "requested") throw new Error("Ride must be requested")
		const ridesAcceptedOrInProgres = accountRides?.filter(ride => ride.getStatus() === 'accepted' || ride.getStatus() === 'in_progres');
		if (ridesAcceptedOrInProgres && ridesAcceptedOrInProgres.length > 0) throw new Error("Driver can not accept ride");
		ride.accept(input.driverId);
		await this.rideRepository?.updateRide(ride);
	}
}

type Input = {
	rideId: string,
	driverId: string,
}

