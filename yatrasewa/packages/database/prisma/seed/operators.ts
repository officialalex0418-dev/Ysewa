import { Prisma } from "@prisma/client";
import { SAMPLE_OPERATORS, SAMPLE_BUSES } from "@yatrasewa/shared-types";
import { generate2x2Deluxe, generateSleeper } from "@yatrasewa/shared-types";
import argon2 from "argon2";

/**
 * Seed sample operators matching UI boards:
 * - Greenline Travels & Tours OP-NP-8821
 * - Sajha Yatayat Co-op
 * - Mountain Deluxe Express
 * - Buddha Air Surface Transport
 * Plus sample vehicles, sample cabin layouts, and test accounts per role.
 */
export async function seedOperatorsFleetAndUsers(prisma: Prisma.TransactionClient) {
  // Default platform commission per operator already set.
  for (const op of SAMPLE_OPERATORS) {
    await prisma.operator.upsert({
      where: { id: op.id },
      update: {},
      create: {
        id: op.id,
        legalName: op.legalName,
        brandName: op.brandName,
        panNo: op.panNo,
        panVerified: op.id === "OP-NP-8821" || op.id === "OP-NP-1001" || op.id === "OP-NP-2048",
        status: op.status as any,
        contactEmail: op.contactEmail,
        contactPhone: op.contactPhone,
        primaryAddress: op.primaryAddress,
        commissionRate: op.commissionRate,
        approvedAt: op.status === "approved" ? new Date() : null,
      },
    });
  }

  // Cabin layouts for Greenline
  const greenlineId = "OP-NP-8821";
  const deluxe2x2 = generate2x2Deluxe("2x2 Deluxe Coach (Greenline)");
  const cabin = await prisma.cabinLayout.create({
    data: {
      operatorId: greenlineId,
      name: deluxe2x2.name,
      layoutJson: deluxe2x2 as any,
      deckCount: deluxe2x2.deckCount,
      totalSeats: deluxe2x2.totalSeats,
    },
  });

  const sleeperLayout = generateSleeper("Sleeper AC (Sajha)");
  const sleeperCabin = await prisma.cabinLayout.create({
    data: {
      operatorId: "OP-NP-1001",
      name: sleeperLayout.name,
      layoutJson: sleeperLayout as any,
      deckCount: sleeperLayout.deckCount,
      totalSeats: sleeperLayout.totalSeats,
    },
  });

  // Seed buses for Greenline
  const busData = [
    { plate: SAMPLE_BUSES[0]!.plateNumber, nickname: SAMPLE_BUSES[0]!.nickname, vtype: "ac_deluxe", layoutId: cabin.id, op: greenlineId, wifi: true, charging: true, water: true, ac: true, gps: true },
    { plate: SAMPLE_BUSES[1]!.plateNumber, nickname: SAMPLE_BUSES[1]!.nickname, vtype: "vip_sofa_2x1", layoutId: cabin.id, op: greenlineId, wifi: true, charging: true, blanket: true, ac: true, gps: true },
    { plate: SAMPLE_BUSES[2]!.plateNumber, nickname: SAMPLE_BUSES[2]!.nickname, vtype: "sleeper", layoutId: sleeperCabin.id, op: "OP-NP-1001", wifi: true, charging: true, blanket: true, ac: true, gps: false },
    { plate: SAMPLE_BUSES[3]!.plateNumber, nickname: SAMPLE_BUSES[3]!.nickname, vtype: "tourist", layoutId: cabin.id, op: "OP-NP-2048", wifi: false, charging: true, water: true, lunch: true, gps: true },
  ];
  for (const b of busData) {
    await prisma.bus.upsert({
      where: { plateNumber: b.plate },
      update: {},
      create: {
        operatorId: b.op,
        plateNumber: b.plate,
        nickname: b.nickname,
        cabinLayoutId: b.layoutId,
        vehicleType: b.vtype as any,
        amenities: {
          wifi: b.wifi,
          chargingPort: b.charging,
          waterBottle: b.water,
          blanket: !!b.blanket,
          ac: b.ac,
          gpsTelematics: b.gps,
          lunchIncluded: !!b.lunch,
        },
        telematicsEnabled: !!b.gps,
        status: "active",
      },
    });
  }

  // Test accounts for all roles
  const pwAdmin = await argon2.hash("A@S@admin##234");
  const pwOperator = await argon2.hash("A@S@operator##234");
  const pwUser = await argon2.hash("A@S@user##234");
  const pwDefault = await argon2.hash("Password123!");

  const testUsers: Array<{ phone: string; fullName: string; role: any; operatorId?: string; email: string; customPassword?: string }> = [
    { phone: "9841000001", fullName: "YatraSewa Super Admin", role: "SUPER_ADMIN", email: "sadmin@yatrasewa.com.np", customPassword: pwAdmin },
    { phone: "9851023456", fullName: "Surendra Shrestha", role: "OPERATOR_OWNER", operatorId: greenlineId, email: "operator@yatrasewa.com.np", customPassword: pwOperator },
    { phone: "9841000008", fullName: "Aayush Shrestha", role: "CUSTOMER", email: "user@yatrasewa.com.np", customPassword: pwUser },
    { phone: "9841000002", fullName: "Aarav Sharma", role: "SYSTEM_EMPLOYEE", email: "aarav@yatrasewa.com.np" },
    { phone: "9841000003", fullName: "Ramesh Thapa", role: "OPERATOR_STAFF", operatorId: greenlineId, email: "dispatch@greenline.com.np" },
    { phone: "9841000004", fullName: "Dipendra Koirala", role: "DRIVER", operatorId: greenlineId, email: "driver@greenline.com.np" },
    { phone: "9841000005", fullName: "Sneha Gurung", role: "CONDUCTOR", operatorId: greenlineId, email: "conductor@greenline.com.np" },
    { phone: "9841000006", fullName: "Bikash Adhikari", role: "BOOKIE_COUNTER", email: "bookie@counter.np" },
    { phone: "9841000007", fullName: "Puja Shrestha", role: "CUSTOMER", email: "puja@example.com" },
  ];

  // Create a bookie counter for Bikash
  let counterId: string | undefined;
  const existingCounter = await prisma.bookieCounter.findFirst({ where: { counterCode: "BKI-KTM-001" } });
  if (!existingCounter) {
    const counter = await prisma.bookieCounter.create({
      data: {
        counterCode: "BKI-KTM-001",
        operatorId: greenlineId,
        ownerName: "Bikash Adhikari",
        address: "New Buspark, Kathmandu",
        floatBalance: 25000,
        floatLimit: 100000,
        isActive: true,
      },
    });
    counterId = counter.id;
  } else {
    counterId = existingCounter.id;
  }

  for (const u of testUsers) {
    const existing = await prisma.user.findFirst({ where: { OR: [{ phone: u.phone }, { email: u.email }] } });
    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { passwordHash: u.customPassword ?? pwDefault, role: u.role, operatorId: u.operatorId },
      });
      continue;
    }
    await prisma.user.create({
      data: {
        phone: u.phone,
        email: u.email,
        fullName: u.fullName,
        role: u.role,
        passwordHash: u.customPassword ?? pwDefault,
        operatorId: u.operatorId,
        counterId: u.role === "BOOKIE_COUNTER" ? counterId : undefined,
        isActive: true,
      },
    });
  }

  // Seed ledger accounts for platform
  const escrow = await prisma.ledgerAccount.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: { id: "00000000-0000-0000-0000-000000000001", accountType: "Platform_Gateway_Escrow", accountOwnerType: "platform", currentBalance: 0 },
  });
  const commissionRev = await prisma.ledgerAccount.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: { id: "00000000-0000-0000-0000-000000000002", accountType: "Platform_Commission_Rev", accountOwnerType: "platform", currentBalance: 0 },
  });
  const tdsPayable = await prisma.ledgerAccount.upsert({
    where: { id: "00000000-0000-0000-0000-000000000003" },
    update: {},
    create: { id: "00000000-0000-0000-0000-000000000003", accountType: "Tax_TDS_Payable", accountOwnerType: "platform", currentBalance: 0 },
  });

  // Create operator payable account per operator
  for (const op of SAMPLE_OPERATORS) {
    await prisma.ledgerAccount.upsert({
      where: { id: `op-payable-${op.id}` },
      update: {},
      create: {
        id: `op-payable-${op.id}`,
        accountType: "Operator_Payable_Account",
        accountOwnerType: "operator",
        accountOwnerId: op.id,
        currentBalance: 0,
      },
    });
  }
  void escrow; void commissionRev; void tdsPayable;
}
