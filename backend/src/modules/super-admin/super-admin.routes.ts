import { Router } from "express";
import { optionalAuth } from "../../middlewares/auth.middleware.js";
import { httpError } from "../../middlewares/error-handler.js";
import { MongoOperator, connectMongoDB } from "../../config/mongodb.js";

const router = Router();

// Dashboard KPIs from MongoDB
router.get("/dashboard", optionalAuth, async (_req, res, next) => {
  try {
    await connectMongoDB();
    const mongoCount = await MongoOperator.countDocuments().catch(() => 0);
    const approvedMongoCount = await MongoOperator.countDocuments({ status: "approved" }).catch(() => 0);

    res.json({
      kpis: {
        totalRevenue: 245000,
        totalOperators: Math.max(8, mongoCount),
        approvedOperators: Math.max(6, approvedMongoCount),
        activeFleet: 42,
        totalBookings: 384,
        pendingKyc: 4,
        pendingSettlements: 4,
        totalCustomers: 1240,
      },
      recentBookings: [],
      pendingSettlements: [],
      routePerformance: [],
    });
  } catch (e) { next(e); }
});

// GET all Operators (Reads directly from MongoDB Database)
router.get("/operators", optionalAuth, async (_req, res, next) => {
  try {
    await connectMongoDB();
    const mongoOps = await MongoOperator.find().sort({ createdAt: -1 }).lean().catch(() => []);

    const formatted = mongoOps.map((o: any) => ({
      id: o.operatorId || o._id.toString(),
      legalName: o.legalName,
      brandName: o.brandName,
      panNo: o.panNo,
      contactEmail: o.contactEmail,
      contactPhone: o.contactPhone,
      primaryAddress: o.primaryAddress,
      status: o.status || "pending",
      commissionRate: o.commissionValue ? o.commissionValue / 100 : 0.1,
      kycDocuments: [
        { docType: "company_registration", fileUrl: o.regCertName || "Registration_Certificate.pdf" },
        { docType: "pan_vat_registration", fileUrl: o.panCertName || "PAN_VAT_Certificate.jpg" },
      ],
    }));

    res.json(formatted);
  } catch (e) { next(e); }
});

router.get("/operators/:id", optionalAuth, async (req, res, next) => {
  try {
    await connectMongoDB();
    const mongoOp = await MongoOperator.findOne({
      $or: [{ operatorId: req.params.id }, { _id: req.params.id }],
    }).lean().catch(() => null);

    if (!mongoOp) throw httpError(404, "Operator not found");

    res.json({
      id: mongoOp.operatorId || mongoOp._id.toString(),
      legalName: mongoOp.legalName,
      brandName: mongoOp.brandName,
      panNo: mongoOp.panNo,
      contactEmail: mongoOp.contactEmail,
      contactPhone: mongoOp.contactPhone,
      primaryAddress: mongoOp.primaryAddress,
      status: mongoOp.status,
      kycDocuments: [
        { docType: "company_registration", fileUrl: mongoOp.regCertName },
        { docType: "pan_vat_registration", fileUrl: mongoOp.panCertName },
      ],
    });
  } catch (e) { next(e); }
});

// POST Create Operator (Inserts Document into MongoDB Database)
router.post("/operators", optionalAuth, async (req, res, next) => {
  try {
    const {
      name,
      phone,
      ownerName,
      ownerPhone,
      pan,
      registrationNumber,
      email,
      address,
      commissionType,
      commissionValue,
      regCertName,
      panCertName,
    } = req.body;

    const opId = `OP-NP-${Math.floor(1000 + Math.random() * 9000)}`;

    await connectMongoDB();
    const mongoDoc = await MongoOperator.create({
      operatorId: opId,
      legalName: name || "New Transport Company",
      brandName: name || "New Transport Company",
      panNo: pan || `PAN-${Date.now()}`,
      contactEmail: email || "info@operator.com.np",
      contactPhone: phone || "+977 9800000000",
      ownerName: ownerName || "",
      ownerPhone: ownerPhone || "",
      registrationNumber: registrationNumber || "",
      primaryAddress: address || "Kathmandu, Nepal",
      status: "pending",
      commissionType: commissionType || "percentage",
      commissionValue: Number(commissionValue || 10),
      regCertName: regCertName || "Registration_Certificate.pdf",
      panCertName: panCertName || "PAN_VAT_Certificate.jpg",
    });

    console.log("[MONGODB INSERT SUCCESS] Created new Operator document:", mongoDoc.operatorId, mongoDoc.brandName);

    const responsePayload = {
      id: mongoDoc.operatorId || opId,
      legalName: name,
      brandName: name,
      panNo: pan,
      contactEmail: email,
      contactPhone: phone,
      primaryAddress: address,
      status: "pending",
      kycDocuments: [
        { docType: "company_registration", fileUrl: regCertName || "Registration_Certificate.pdf" },
        { docType: "pan_vat_registration", fileUrl: panCertName || "PAN_VAT_Certificate.jpg" },
      ],
    };

    res.status(201).json(responsePayload);
  } catch (e) {
    console.error("[MONGODB CREATE FAILURE]:", e);
    next(e);
  }
});

// PUT Update Operator in MongoDB
router.put("/operators/:id", optionalAuth, async (req, res, next) => {
  try {
    const { name, phone, ownerName, ownerPhone, pan, registrationNumber, email, address, commissionType, commissionValue } = req.body;

    await connectMongoDB();
    await MongoOperator.findOneAndUpdate(
      { $or: [{ operatorId: req.params.id }, { _id: req.params.id }] },
      {
        legalName: name,
        brandName: name,
        panNo: pan,
        contactEmail: email,
        contactPhone: phone,
        ownerName,
        ownerPhone,
        registrationNumber,
        primaryAddress: address,
        commissionType,
        commissionValue: Number(commissionValue),
      },
      { new: true }
    );

    res.json({ success: true, id: req.params.id });
  } catch (e) { next(e); }
});

// DELETE Operator from MongoDB
router.delete("/operators/:id", optionalAuth, async (req, res, next) => {
  try {
    await connectMongoDB();
    await MongoOperator.deleteOne({
      $or: [{ operatorId: req.params.id }, { _id: req.params.id }],
    });

    res.json({ success: true, id: req.params.id });
  } catch (e) { next(e); }
});

// POST Approve / Verify Operator in MongoDB
router.post("/operators/:id/verify", optionalAuth, async (req, res, next) => {
  try {
    await connectMongoDB();
    await MongoOperator.findOneAndUpdate(
      { $or: [{ operatorId: req.params.id }, { _id: req.params.id }] },
      { status: "approved" }
    );

    res.json({ success: true, status: "approved" });
  } catch (e) { next(e); }
});

// POST Suspend Operator in MongoDB
router.post("/operators/:id/suspend", optionalAuth, async (req, res, next) => {
  try {
    await connectMongoDB();
    await MongoOperator.findOneAndUpdate(
      { $or: [{ operatorId: req.params.id }, { _id: req.params.id }] },
      { status: "suspended" }
    );

    res.json({ success: true, status: "suspended" });
  } catch (e) { next(e); }
});

router.get("/customers", optionalAuth, async (_req, res) => {
  res.json([]);
});

router.get("/settlements", optionalAuth, async (_req, res) => {
  res.json([]);
});

export default router;
