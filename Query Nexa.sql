CREATE VIEW karyawan_MuhammadSetiadiPratama
AS 
SELECT row_number() over(order by nip) as no, nip, nama, alamat, case when gend='L' then 'Laki - Laki' else 'Perempuan' END AS gender,
DATE_FORMAT(tgl_lahir, '%d %M %Y') as tanggal_lahir 
from karyawan


CREATE PROCEDURE sp_add_kary_MuhammadSetiadiPratama (IN `nip_kar` VARCHAR(50), IN `nama_kar` VARCHAR(50), IN `alamat_kar` VARCHAR(200), IN `gender_kar` ENUM('L','P'), IN `tgl_lahir_kar` DATE, IN `photo_kar` TEXT, IN `username` VARCHAR(50), OUT `keterangan` VARCHAR(100))

BEGIN
	DECLARE nipsama,nipbaru varchar(50);

	SELECT nip into nipsama from karyawan where nip=nip_kar;
	
    SELECT LPAD(RIGHT(max(nip)+1, 4), 8, YEAR(NOW())) into nipbaru from karyawan;
    
	IF nipsama = nip_kar 
	THEN 
		set keterangan=CONCAT('DATA GAGAL DISIMPAN NIP SUDAH ADA, GUNAKAN NIP INI: ', nipbaru, ' ATAU INPUT NIP LAIN. ');
        
        -- INSERT INTO `karyawan`(`nip`, `nama`, `alamat`, `gend`, `photo`, `tgl_lahir`, `status`, `insert_at`, `insert_by`, `update_at`, `update_by`) VALUES (nipbaru,nama_kar,alamat_kar,gender_kar,photo_kar,tgl_lahir_kar,
        -- 0,NOW(),username,NOW(),username);
        
        -- select * from karyawan ORDER BY nip DESC LIMIT 1;
    ELSE 
        INSERT INTO `karyawan`(`nip`, `nama`, `alamat`, `gend`, `photo`, `tgl_lahir`, `status`, `insert_at`, `insert_by`, `update_at`, `update_by`) VALUES (nipbaru,nama_kar,alamat_kar,gender_kar,photo_kar,tgl_lahir_kar,
        0,NOW(),username,NOW(),username);
        
        set keterangan='NIP TERSEDIA, DATA BERHASIL DISIMPAN. ';
        
        select * from karyawan ORDER BY nip DESC LIMIT 1;
	END IF;
END


