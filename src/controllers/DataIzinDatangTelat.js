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

        if(rule == 'subordinate')
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


export default controller;