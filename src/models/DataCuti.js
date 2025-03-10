import { Sequelize, Op } from "sequelize";
import db from "../config/Database.js";
import moment from 'moment';
import model from "../models/index.js";

const { DataTypes } = Sequelize;

const DataCuti = db.define('data_cuti', {

    ID_DATA_CUTI: {
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
    HP:{type: DataTypes.STRING},
    TGL_PENGAJUAN:{type: DataTypes.DATE},
    TGL_MULAI_CUTI:{type: DataTypes.DATE},
    TGL_AKHIR_CUTI:{type: DataTypes.DATE},
    LAMA_CUTI:{type: DataTypes.STRING},
    CUTI_YANG_DI_IZINKAN:{type: DataTypes.STRING},
    NO_INDUK_PLH:{type: DataTypes.STRING},
    NAMA_PLH:{type: DataTypes.STRING},
    JABATAN_PLH:{type: DataTypes.STRING},
    STATUS_APPROVAL:{type: DataTypes.STRING},
    NAMA_TINDAK_LANJUT:{type: DataTypes.STRING},

}, {
    freezeTableName:true
});

DataCuti.getSisaCuti = async(noInduk) =>{
    try{

        // Ambil tanggal masuk dari database
        const tglMasukRecords = await model.Pegawai.findAll({
            attributes: ['TGL_MASUK'],
            where: { NO_INDUK: noInduk }
        });

        let tglMasuk = null;
        if (tglMasukRecords.length > 0) {
            tglMasuk = tglMasukRecords[0].TGL_MASUK; // Ambil TGL_MASUK dari record pertama
        }

        if (!tglMasuk) {
            throw new Error('Tanggal masuk tidak ditemukan.');
        }

        // Ambil tanggal dan bulan dari TGL_MASUK
        const tglmsk = moment(tglMasuk).date(); // Ambil tanggal
        const blnmsk = moment(tglMasuk).month() + 1; // Ambil bulan (moment.js mulai dari 0)

        // Tanggal masuk tahun ini
        const tglMasukTahunIni = moment(`${moment().year()}-${blnmsk}-${tglmsk}`, 'YYYY-MM-DD');

        let patokanAwal, patokanAkhir;

        // Tentukan patokan awal dan akhir
        if (moment().isBefore(tglMasukTahunIni)) {
            patokanAwal = tglMasukTahunIni.clone().subtract(1, 'year').format('YYYY-MM-DD');
            patokanAkhir = tglMasukTahunIni.format('YYYY-MM-DD');
        } else {
            patokanAwal = tglMasukTahunIni.format('YYYY-MM-DD');
            patokanAkhir = tglMasukTahunIni.clone().add(1, 'year').format('YYYY-MM-DD');
        }

        // Hitung jumlah hari cuti yang diizinkan
        const jmlHari = await DataCuti.sum('CUTI_YANG_DI_IZINKAN', {
            where: {
                NO_INDUK: noInduk,
                TGL_MULAI_CUTI: { [Op.between]: [patokanAwal, patokanAkhir] },
                STATUS_APPROVAL: '1'
            }
        });

        // Hitung sisa cuti
        const sisaCuti = 12 - (jmlHari || 0);

        return sisaCuti;

    } catch (error) {
        console.error('Error calculating sisa cuti:', error);
        throw error;
    }
}

DataCuti.getLamaCuti = async(dtAwal, dtAkhir) =>{
    try {
        let jmlHari = 0;
        const dt1 = moment(dtAwal, 'YYYY-MM-DD'); // Konversi tanggal awal ke moment
        const dt2 = moment(dtAkhir, 'YYYY-MM-DD'); // Konversi tanggal akhir ke moment

        // Hitung selisih hari
        const selisihHari = dt2.diff(dt1, 'days');

        let date = dt1.clone(); // Salin tanggal awal
        let x = 0;

        while (x <= selisihHari) {
            let data = null;

            // Query untuk memeriksa apakah tanggal ada di tabel Kalender
            const header2 = await model.Kalender.findOne({
                attributes: ['DATE'],
                where: {
                    DATE: date.format('YYYY-MM-DD') // Format tanggal ke 'YYYY-MM-DD'
                }
            });

            if (header2) {
                data = header2.DATE; // Ambil nilai DATE jika ada
            }

            // Tambahkan jumlah hari jika data kosong (bukan hari libur atau kalender khusus)
            if (!data) {
                jmlHari++;
            }

            // Pindah ke tanggal berikutnya
            date.add(1, 'days');
            x++;
        }

        return jmlHari; // Kembalikan jumlah hari
    } catch (error) {
        console.error('Error calculating lama cuti:', error);
        throw error;
    }
}



export default DataCuti;