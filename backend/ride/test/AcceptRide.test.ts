import { AccountRepositoryDatabase } from "../src/infra/repository/AccountRepository";
import { PgPromiseAdapter } from "../src/infra/database/DatabaseConnection";
import { Registry } from "../src/infra/di/DI";
import GetRide from "../src/application/usecase/GetRide";
import { MailerGatewayMemory } from "../src/infra/gateway/MailerGateway";
import { RideRepositoryDatabase } from "../src/infra/repository/RideRepository";
import Signup from "../src/application/usecase/Signup";
import RequestRide from "../src/application/usecase/RequestRide";
import AcceptRide from "../src/application/usecase/AcceptRide";

let signup: Signup;
let requestRide: RequestRide;
let acceptRide: AcceptRide;
let getRide: GetRide;

beforeEach(() => {
	Registry.getInstance().provide("databaseConnection", new PgPromiseAdapter());
	Registry.getInstance().provide("accountRepository", new AccountRepositoryDatabase());
	Registry.getInstance().provide("rideRepository", new RideRepositoryDatabase());
	Registry.getInstance().provide("mailerGateway", new MailerGatewayMemory());
	signup = new Signup();
	requestRide = new RequestRide();
	getRide = new GetRide();
	acceptRide = new AcceptRide();
});

test("Deve aceitar uma corrida", async function () {
	const inputPassengerSignup = {
		name: "John Doe",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "97456321558",
		password: "123456",
		isPassenger: true
	};
	const outputPassengerSignup = await signup.execute(inputPassengerSignup);
	const inputRequestRide = {
		passengerId: outputPassengerSignup.accountId,
		fromLat: -27.584905257808835,
		fromLong: -48.545022195325124,
		toLat: -27.496887588317275,
		toLong: -48.522234807851476
	};
	const outputRequestRide = await requestRide.execute(inputRequestRide);
	const inputDriverSignup = {
		name: "John Doe",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "97456321558",
		password: "123456",
		carPlate: "AAA1234",
		isDriver: true
	};
	const outputDriverSignup = await signup.execute(inputDriverSignup);
	const inputAcceptRide = {
		rideId: outputRequestRide.rideId,
		driverId: outputDriverSignup.accountId
	};
	await acceptRide.execute(inputAcceptRide);
	const outputGetRide = await getRide.execute(outputRequestRide.rideId);
	expect(outputGetRide.driverId).toBe(outputDriverSignup.accountId);
	expect(outputGetRide.status).toBe("accepted");
});

test("Não deve aceitar uma corrida se a conta não for de um motorista", async function () {
	const inputPassengerSignup = {
		name: "John Doe",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "97456321558",
		password: "123456",
		isPassenger: true
	};
	const outputPassengerSignup = await signup.execute(inputPassengerSignup);
	const inputRequestRide = {
		passengerId: outputPassengerSignup.accountId,
		fromLat: -27.584905257808835,
		fromLong: -48.545022195325124,
		toLat: -27.496887588317275,
		toLong: -48.522234807851476
	};
	const outputRequestRide = await requestRide.execute(inputRequestRide);
	const inputAcceptRide = {
		rideId: outputRequestRide.rideId,
		driverId: outputPassengerSignup.accountId
	};
	await expect(() => acceptRide.execute(inputAcceptRide)).rejects.toThrow(new Error("Account must be from a driver"));
});

test("Não deve aceitar uma corrida se o status for diferente de 'requested'", async function () {
	const inputPassengerSignup = {
		name: "John Doe",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "97456321558",
		password: "123456",
		isPassenger: true
	};
	const outputPassengerSignup = await signup.execute(inputPassengerSignup);
	const inputRequestRide = {
		passengerId: outputPassengerSignup.accountId,
		fromLat: -27.584905257808835,
		fromLong: -48.545022195325124,
		toLat: -27.496887588317275,
		toLong: -48.522234807851476
	};
	const outputRequestRide = await requestRide.execute(inputRequestRide);
	const inputDriverSignup = {
		name: "John Doe",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "97456321558",
		password: "123456",
		carPlate: "AAA1234",
		isDriver: true
	};
	const outputDriverSignup = await signup.execute(inputDriverSignup);
	const inputAcceptRide = {
		rideId: outputRequestRide.rideId,
		driverId: outputDriverSignup.accountId
	};
	await acceptRide.execute(inputAcceptRide);
	await expect(() => acceptRide.execute(inputAcceptRide)).rejects.toThrow(new Error("Ride must be requested"));
});

test("Não deve aceitar uma corrida se o motorista tiver outra com status 'accepted' ou 'in_progres'", async function () {
	const inputPassengerSignup = {
		name: "John Doe",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "97456321558",
		password: "123456",
		isPassenger: true
	};
	const outputPassengerSignup = await signup.execute(inputPassengerSignup);
	const inputRequestRide = {
		passengerId: outputPassengerSignup.accountId,
		fromLat: -27.584905257808835,
		fromLong: -48.545022195325124,
		toLat: -27.496887588317275,
		toLong: -48.522234807851476
	};
	const outputRequestRide = await requestRide.execute(inputRequestRide);
	const inputDriverSignup = {
		name: "John Doe",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "97456321558",
		password: "123456",
		carPlate: "AAA1234",
		isDriver: true
	};
	const outputDriverSignup = await signup.execute(inputDriverSignup);
	const inputAcceptRideA = {
		rideId: outputRequestRide.rideId,
		driverId: outputDriverSignup.accountId
	};
	await acceptRide.execute(inputAcceptRideA);
	const inputRequestRideB = {
		passengerId: outputPassengerSignup.accountId,
		fromLat: -27.584905257808835,
		fromLong: -48.545022195325124,
		toLat: -27.496887588317275,
		toLong: -48.522234807851476
	};
	const outputRequestRideB = await requestRide.execute(inputRequestRide);
	const inputAcceptRideB = {
		rideId: outputRequestRideB.rideId,
		driverId: outputDriverSignup.accountId
	};
	await expect(() => acceptRide.execute(inputAcceptRideB)).rejects.toThrow(new Error("Driver can not accept ride"));
});

afterEach(async () => {
	const connection = Registry.getInstance().inject("databaseConnection");
	await connection.close();
});
