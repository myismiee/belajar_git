import express from "express";
import controller from "../controllers/index.js"
import middleware from "../middleware/index.js"

const router = express.Router();

router.get('/api/v2/permission-came-late/approval', middleware.verifyToken.verify, controller.dataIzinDatangTelat.getDataApprovalPengajuanDatangTelat )//get list approval
router.get('/api/v2/permission-came-late/', middleware.verifyToken.verify, controller.dataIzinDatangTelat.getDataPengajuanDatangTelat )//get list data dengan query "month(bulan absen), year(tahun absen) dan rule(subordinate untuk bawahan dan null untuk dirisendiri)"
router.get('/api/v2/permission-came-late/:id', middleware.verifyToken.verify, controller.dataIzinDatangTelat.getDataPengajuanDatangTelatDetail)//get detail

router.patch('/api/v2/permission-came-late/:id/approval', middleware.verifyToken.verify, controller.dataIzinDatangTelat.doApprovalPengajuanDatangTelat)//approval 
router.patch('/api/v2/permission-came-late/:id/reject', middleware.verifyToken.verify, controller.dataIzinDatangTelat.doRejectPengajuanDatangTelat)//reject

router.post('/api/v2/permission-came-late', middleware.verifyToken.verify, controller.dataIzinDatangTelat.doCreatePengajuanDatangTelat)//tambah
router.patch('/api/v2/permission-came-late/:id', middleware.verifyToken.verify, controller.dataIzinDatangTelat.doUpdatePengajuanDatangTelat)//update 
router.delete('/api/v2/permission-came-late/:id', middleware.verifyToken.verify, controller.dataIzinDatangTelat.doDeletePengajuanDatangTelat)//delete 

export default router;