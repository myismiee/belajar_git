import model from "../models/index.js";
import moment from 'moment';
import sequelize, { Sequelize, Op } from "sequelize";
import db from "../config/Database.js";
import { response } from "express";

export const generateID = (length) => { 
    return moment().format('YYMM')+Array.from({ length }, () =>
      Math.floor(Math.random() * 36).toString(36) // 0-9 dan a-z
    ).join('');
};
export const generateIDAbsen = (length) => { 
    return moment().format('YYMMDDHHmm')+Array.from({ length }, () =>
      Math.floor(Math.random() * 36).toString(36) // 0-9 dan a-z
    ).join('');
};
const isValidDate = (dateStr) => {
    return !moment(dateStr, 'YYYY-MM-DD', true).isValid();
};

const controller = {};

controller.getDataPengajuanDatangTelat = async(req, res)  =>{ 
    try {
        let data;
        let noInduk = await model.Pegawai.getNoIndukFromJWT(req.headers.authorization);
        const { 
            month = '',
            year = '',
            rule = '',
        } = req.query;

        if(true)
        {
            const pegawai = await model.Pegawai.findOne({
                where: {
                    NO_INDUK: noInduk,
                },
            });
            // const whereQuery = await model.Pegawai.getQueryBawahan('MANAJER BIDANG INFORMASI TEKNOLOGI','0000');
            const whereQuery = await model.Pegawai.getQueryBawahan(pegawai.JABATAN,pegawai.ID_UNIT);

            let query = `SELECT * FROM data_izin_datang_telat WHERE ${whereQuery} AND MONTH(TGL_IZIN_DATANG_TELAT) = '${month}' AND YEAR(TGL_IZIN_DATANG_TELAT) = '${year}'`;

            data = await db.query(query, {
                type: Sequelize.QueryTypes.SELECT,
            });
        }
        else
        {
            data = await model.DataIzinDatangTelat.findAll({
                where: {
                    NO_INDUK: noInduk,
                    [Op.and]: [
                        sequelize.where(sequelize.fn('MONTH', sequelize.col('TGL_IZIN_DATANG_TELAT')), month),
                        sequelize.where(sequelize.fn('YEAR', sequelize.col('TGL_IZIN_DATANG_TELAT')), year)
                    ]
                }
            });
        }
        
        const response = {
            "data": data,
        }

        res.json(response);
    } catch (error) {
        console.log(error);
    }
}
controller.getDataPengajuanDatangTelatDetail = async(req, res) =>{
    try {
        const data = await model.DataIzinDatangTelat.findOne({
            where:{
                ID_DATA_IZIN_DATANG_TELAT: req.params.id
            },
        });

        res.json(data);
    } catch (error) {
        console.log(error);
    }
}
controller.getDataApprovalPengajuanDatangTelat = async(req, res) =>{
    try {
        let data;
        
        data = await model.DataIzinDatangTelat.findAll({
            where: await model.Pegawai.getQueryApprovalCutiIzin(await model.Pegawai.getNoIndukFromJWT(req.headers.authorization)),
            order: [['TGL_IZIN_DATANG_TELAT', 'DESC']],
        });

        const response = {
            "data": data,
        }

        res.json(response);
    } catch (error) {
        console.log(error);
    }
}

controller.doCreatePengajuanDatangTelat = async(req, res) =>{
    const { tglIzinDatangTelat, alasan} = req.body;
    const id = generateID(6);
    const noInduk = await model.Pegawai.getNoIndukFromJWT(req.headers.authorization);

    let statValidasi = false;

    if(isValidDate(tglIzinDatangTelat)){
        res.status(400).json({msg: "Mohon Isi Tanggal Dengan Benar!!!."})
    }
    else if(!alasan || alasan.trim() === ""){
        res.status(400).json({msg: "Alasan Harus Diisi!!!."})
    }
    else{
        statValidasi = true;
    }

    try{

        if(statValidasi)
        {
            const pegawai = await model.Pegawai.findOne({
                where: {
                    NO_INDUK: noInduk
                },
            });
    
            const jabatanPegawai = await model.DataJabatan.findOne({
                where: {
                    NAMA_JABATAN: pegawai.JABATAN
                },
            });
    
            var statApproval = "";
    
            if(jabatanPegawai.ID_REKOMENDASI_CUTI=="-"){statApproval = "2"}else{statApproval = "0"}
    
            await model.DataIzinDatangTelat.create({
                ID_DATA_IZIN_DATANG_TELAT: id,
                NO_INDUK: noInduk,
                NAMA: pegawai.NAMA,
                JABATAN: pegawai.JABATAN,
                DIVISI: pegawai.DIVISI,
                BIDANG: pegawai.BIDANG,
                SUB_BIDANG: pegawai.SUB_BIDANG,
                TGL_IZIN_DATANG_TELAT: tglIzinDatangTelat,
                ALASAN: alasan,
                STATUS_APPROVAL: statApproval,
                NAMA_TINDAK_LANJUT: "-",
            });
    
            res.status(200).json({msg: "Pengajuan Datang Telat Berhasil Disimpan."}); 
        }
        else{
            res.status(400).json({msg: "Terjadi Kesalahan Ketika Pengisian data!!!."})
        }

    }
    catch(error){
        console.log(error);
    }
}


export default controller;