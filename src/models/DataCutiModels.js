import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const DataIzinDatangTelat = db.define('data_izin_datang_telat', {

    ID_DATA_IZIN_DATANG_TELAT: {
        type: DataTypes.STRING,
        primaryKey: true,
        // allowNull: false,
        // defaultValue: DataTypes.UUIDV4,      
    },
    NO_INDUK:{type: DataTypes.STRING},
    NAMA:{type: DataTypes.STRING},
    JABATAN:{type: DataTypes.STRING},
    DIVISI:{type: DataTypes.STRING},
    BIDANG:{type: DataTypes.STRING},
    SUB_BIDANG:{type: DataTypes.STRING},
    TGL_IZIN_DATANG_TELAT:{type: DataTypes.DATE},
    ALASAN:{type: DataTypes.STRING},
    STATUS_APPROVAL:{type: DataTypes.STRING},
    NAMA_TINDAK_LANJUT:{type: DataTypes.STRING},

}, {
    freezeTableName:true
});


export default DataIzinDatangTelat;