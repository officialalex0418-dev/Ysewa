import mongoose from "mongoose";
import argon2 from "argon2";
import { connectMongoDB } from "../config/mongodb.js";
import { User } from "../models/User.js";
import { Operator } from "../models/Operator.js";
import { Bus } from "../models/Bus.js";
import { City, Route } from "../models/Route.js";
import { Trip } from "../models/Trip.js";
import { TripSeat } from "../models/TripSeat.js";
import { generate2x2Deluxe } from "../types/index.js";

async function seed() {
  await connectMongoDB();

  console.log("Clearing old collections...");
  await Promise.all([
    User.deleteMany({}),
    Operator.deleteMany({}),
    Bus.deleteMany({}),
    City.deleteMany({}),
    Route.deleteMany({}),
    Trip.deleteMany({}),
    TripSeat.deleteMany({}),
  ]);

  console.log("Seeding Users...");
  const passwordHash = await argon2.hash("SaAdm&^%mn");

  const [sadmin, opOwner, customer] = await User.insertMany([
    {
      fullName: "Super Admin",
      email: "sadmin@rcs.com.np",
      phone: "9800000001",
      passwordHash,
      role: "SUPER_ADMIN",
    },
    {
      fullName: "Operator Owner",
      email: "operator@rcs.com.np",
      phone: "9800000002",
      passwordHash,
      role: "OPERATOR_OWNER",
    },
    {
      fullName: "Regular User",
      email: "user@rcs.com.np",
      phone: "9800000003",
      passwordHash,
      role: "CUSTOMER",
    },
  ]);

  console.log("Seeding Operators...");
  const operator = await Operator.create({
    legalName: "RCS Travels Pvt. Ltd.",
    brandName: "RCS Travels",
    panNo: "123456789",
    contactEmail: "operator@rcs.com.np",
    contactPhone: "01-4000000",
    primaryAddress: "Kathmandu, Nepal",
    status: "approved",
  });

  // Link operator owner to operator
  opOwner.operatorId = operator._id as mongoose.Types.ObjectId;
  await opOwner.save();

  console.log("Seeding Buses...");
  const bus = await Bus.create({
    operatorId: operator._id,
    plateNumber: "BA 1 KHA 1234",
    vehicleType: "ac_deluxe",
    nickname: "RCS Deluxe",
    amenities: { wifi: true, ac: true, chargingPort: true },
    cabinLayout: {
      totalSeats: 39,
      layoutJson: generate2x2Deluxe("Deluxe 2x2"),
    },
  });

  console.log("Seeding Cities...");
  const [ktm, pkr, ctw] = await City.insertMany([
    { name: "Kathmandu", state: "Bagmati" },
    { name: "Pokhara", state: "Gandaki" },
    { name: "Chitwan", state: "Bagmati" },
  ]);

  console.log("Seeding Routes...");
  const route = await Route.create({
    routeName: "Kathmandu - Pokhara",
    originCityId: ktm._id,
    destCityId: pkr._id,
    distanceKm: 200,
    stops: [
      { stopName: "Kalanki", sequence: 1, arrivalOffsetMin: 15, isBoarding: true, isDropping: false },
      { stopName: "Muglin", sequence: 2, arrivalOffsetMin: 180, isBoarding: false, isDropping: true },
      { stopName: "Tourist Bus Park", sequence: 3, arrivalOffsetMin: 360, isBoarding: false, isDropping: true },
    ],
  });

  console.log("Seeding Trips...");
  const tripDate = new Date();
  const departureTime = new Date();
  departureTime.setHours(7, 0, 0, 0); // 7 AM today
  const arrivalTime = new Date(departureTime.getTime() + 6 * 3600000); // +6 hours

  const trip = await Trip.create({
    operatorId: operator._id,
    busId: bus._id,
    routeId: route._id,
    tripDate,
    departureTime,
    arrivalTime,
    fare: 1000,
    availableSeats: 39,
    status: "scheduled",
  });

  console.log("Seeding Seats for Trip...");
  const seatsData = [];
  // Assuming generate2x2Deluxe generates seats somehow. Let's just create 39 seats manually for the mock
  for (let i = 1; i <= 39; i++) {
    const label = `A${i}`;
    seatsData.push({
      tripId: trip._id,
      seatLabel: label,
      status: "available",
      version: 1,
    });
  }
  await TripSeat.insertMany(seatsData);

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
