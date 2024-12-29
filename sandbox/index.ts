import 'dotenv/config';
import { client } from '../src/services/redis';

const run = async () => {
	const keyType = await client.type('car');
	if (keyType !== 'hash' && keyType !== 'none') await client.del('car');
	//await client.hSet('car', { make: 'Toyota', model: 'Corolla', year: 2019 }); // store car object in Redis

	// store null and undefined values in Redis
	/*
		in redis it stores data as follows:
		make: Toyota.toString()
		model: Corolla.toString()
		year: 2019.toString()
		color: null.toString() ?!! will give error, instead use color: null || '', so it stores empty string
		price: undefined.toString() ?!! will give error, instead use price: undefined || '', so it stores empty string
	*/
	//await client.hSet('car', { make: 'Toyota', model: 'Corolla', year: 2019, color: null || '', price: undefined || ''});

	// Nested object
	/*
		instead of storing nested object as object, store it as string
		solution: JSON.stringify({ name: 'John', age: 30 })
	 */

	/*	await client.hSet('car', {
			make: 'Toyota',
			model: 'Corolla',
			year: 2019,
			color: 'red',
			price: 20000,
			owner: JSON.stringify({ name: 'John', age: 30 })
		});*/

	// undefined and null values of get method
	const car = await client.hGetAll('car5');
	if (Object.keys(car).length === 0) {
		console.log('Car not found in Redis');
		return;
	}
	console.log(car);
};
//run();



async function workWithPiplines() {

	await client.hSet('car', { make: 'Toyota', model: 'Corolla', year: 2019 });
	await client.hSet('car2', { make: 'Toyota2', model: 'Corolla2', year: 2019 });
	await client.hSet('car3', { make: 'Toyota3', model: 'Corolla3', year: 2019 });

	const result = await Promise.all([
		client.hGetAll('car'),
		client.hGetAll('car2'),
		client.hGetAll('car3')
	]);

	console.log(result);
}

workWithPiplines();