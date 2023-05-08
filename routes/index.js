var express = require('express');
var router = express.Router();
const mysql = require('mysql');
var moment = require('moment');
var session = require('express-session');
var flash = require('connect-flash');
var alert = require('alert'); 


var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "covid2"
});


connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});



/* GET home page. */
router.get('/', function(req, res) {
  let sql = "SELECT * FROM BENHNHAN";
  let query = connection.query(sql,(err,rows) => {
    if(err) throw err;
    res.render('index', { patient:rows});
  });
});



// Thêm bệnh nhân
router.post('/patient-add',  (req, res) => {
  let date  = moment(req.body.ngaysinh).format('YYYY-MM-DD');
  let data = {CMND: req.body.CMND,
              Hovaten: req.body.hoten,
              Ngaythangnamsinh: date,
              Gioitinh: req.body.gioitinh,
              Diachi: req.body.diachi,
              SDT: req.body.sdt,
              };  
  let sql = " INSERT IGNORE INTO BENHNHAN SET ?";   
  const query = `SELECT COUNT(*) AS count FROM BENHNHAN WHERE CMND = '${req.body.CMND}'`;
  connection.query(query, (err, results) => {
    if (err) {
      throw err;
    }
    if (results[0].count === 0) {
        let query1 = connection.query(sql,data,(err,results) =>{
        alert("Thêm bệnh nhân thành công");
        res.redirect('/');
        });        
    } else {
      alert('Số CMND đã tồn tại trong hệ thống');
    }
  });
});

// Sửa  bệnh nhân

router.get('/patient-update/:CMND', function(req, res) {
  let CMND_number = req.params.CMND;
  let sql = `SELECT * FROM BENHNHAN where CMND = ${CMND_number}`;
  let query = connection.query(sql,(err,result) => {
    if(err) throw err;
    let date = moment(result[0].Ngaythangnamsinh).format('YYYY-MM-DD');
    res.render('patient-update', { patient:result[0], date:date});
  });
});
// update data vao MySQL
router.post('/patient-update', function(req, res) {
  let date  = moment(req.body.ngaysinh).format('YYYY-MM-DD');
  let CMND = req.body.CMND;
  let Hovaten= req.body.hoten;
  let Gioitinh= req.body.gioitinh;
  let Diachi= req.body.diachi;
  let SDT=req.body.sdt;

  let sql = `UPDATE BENHNHAN SET Hovaten = '${Hovaten}',
                                Ngaythangnamsinh = '${date}',
                                Gioitinh = '${Gioitinh}',
                                Diachi = '${Diachi}',
                                SDT = '${SDT}'
                                WHERE CMND = ${CMND}
            `
  let query = connection.query(sql, function(error, results) {
    if (error) throw error;
    res.redirect('/');
  });
});

// xoá  bệnh nhân

router.get('/patient-delete/:CMND', function(req, res) {
  const Patient_CMND = req.params.CMND;
  let sql = `DELETE  FROM BENHNHAN where CMND = ${Patient_CMND} AND NOT EXISTS(SELECT * FROM BS_XN_BN WHERE CMND = ${Patient_CMND})`;
  let query = connection.query(sql,(err,result) => {
    if(err) {
      throw err;
    } else if (result.affectedRows > 0) {
      alert('Xoá thành công');
      res.redirect('/');
    } else {
      alert('Không thể xoá : Thông tin bệnh nhân được lưu ở dữ liệu khác trong hệ thống');
      res.redirect('/');
    }
  });
});

// BÁC SĨ
router.get('/doctor', function(req, res) {
  let sql = "SELECT * FROM BACSI";
  let query = connection.query(sql,(err,rows) => {
    if(err) throw err;
    res.render('doctor', {doctor:rows});
  });
});

// Thêm bác sĩ
router.post('/doctor-add',  (req, res) => {
  let data = {Donvilaymau: req.body.Donvilaymau,
    Lanhdaodonvi: req.body.Lanhdaodonvi,
    Bacsixetnghiem: req.body.Bacsixetnghiem,
    }; 
  console.log(data);
  let sql = " INSERT IGNORE INTO BACSI SET ?";   
  const query = `SELECT COUNT(*) AS count FROM BACSI WHERE Donvilaymau = '${req.body.Donvilaymau}'`;
  connection.query(query, (err, results) => {
    if (err) {
      throw err;
    }
    if (results[0].count === 0) {
        let query1 = connection.query(sql,data,(err,results) =>{
        alert("Thêm bác sĩ thành công");
        res.redirect('/doctor');
        });        
    } else {
      alert('Đơn vị lấy mẫu đã tồn tại trong hệ thống');
    }
  });
});

// Sửa thông tin bác sĩ
router.get('/doctor-update/:Donvilaymau', function(req, res) {
  let Donvilaymau = req.params.Donvilaymau;
  console.log('don vi lay mau la: ',Donvilaymau);
  let sql = `SELECT * FROM BACSI where Donvilaymau = ${mysql.escape(Donvilaymau)}`;
  let query = connection.query(sql,(err,result) => {
    if(err) throw err;
    res.render('doctor-update', { doctor:result[0]});
  });
});

router.post('/doctor-update', function(req, res) {
  let Donvilaymau = req.body.Donvilaymau;
  let Lanhdaodonvi= req.body.Lanhdaodonvi;
  let Bacsixetnghiem= req.body.Bacsixetnghiem;

  let sql = `UPDATE BACSI SET Lanhdaodonvi = '${Lanhdaodonvi}',
                                Bacsixetnghiem = '${Bacsixetnghiem}'
                                WHERE Donvilaymau = ${mysql.escape(Donvilaymau)}
            `
  let query = connection.query(sql, function(error, results) {
    if (error) throw error;
    res.redirect('/doctor');
  });
});

// xoá bác sĩ
router.get('/doctor-delete/:Donvilaymau', function(req, res) {
  const Donvilaymau = req.params.Donvilaymau;
  let sql = `DELETE  FROM BACSI where Donvilaymau = ${mysql.escape(Donvilaymau)} AND NOT EXISTS(SELECT * FROM BS_XN_BN WHERE Donvilaymau = ${mysql.escape(Donvilaymau)})`;
  let query = connection.query(sql,(err,result) => {
    if(err) {
      throw err;
    } else if (result.affectedRows > 0) {
      alert('Xoá thành công');
      res.redirect('/doctor');
    } else {
      alert('Không thể xoá : Thông tin đơn vị được lưu ở dữ liệu khác trong hệ thống');
      res.redirect('/doctor');
    }
  });
});

// khám bệnh

router.get('/test', function(req, res) {
    // lấy tất cả rows của Benh nhan table
    let sql_patient =  "SELECT CMND FROM BENHNHAN"
    let data_patient ="";
    let query_patient = connection.query(sql_patient,(err,rows) => {
      if(err) throw err;
      data_patient = rows
    });
  // lấy tất cả rows của Bacsi table
  let sql_doctor =  "SELECT Donvilaymau FROM BACSI"
  let data_doctor ="";
  let query_doctor = connection.query(sql_doctor,(err,rows) => {
    if(err) throw err;
    data_doctor = rows
  });
  // join 3 bảng 
  let sql = "SELECT * FROM BS_XN_BN JOIN BACSI on BS_XN_BN.Donvilaymau = BACSI.Donvilaymau  JOIN BENHNHAN on BS_XN_BN.CMND = BENHNHAN.CMND";
  let query = connection.query(sql,(err,rows) => {
    if(err) throw err;
    res.render('test', {test:rows,doctor:data_doctor,patient:data_patient});
  });
});

// Thêm khám bệnh

router.post('/test-add',  (req, res) => {
  let date  = moment(req.body.Ngaylaymau).format('YYYY-MM-DD');
  let data = {Masoxetnghiem: req.body.Masoxetnghiem,
    CMND: req.body.CMND,
    Donvilaymau: req.body.Donvilaymau,
    Loaixetnghiem: req.body.Loaixetnghiem,
    Benhphamthuthap: req.body.Benhphamthuthap,
    Tinhtrangmau: req.body.Tinhtrangmau,
    Lanxetnghiem: req.body.Lanxetnghiem,
    Ngaylaymau: date,
    Ketquaxetnghiem: req.body.Ketquaxetnghiem,
    }; 
  let sql = " INSERT IGNORE INTO BS_XN_BN SET ?";   
  const query = `SELECT COUNT(*) AS count FROM BS_XN_BN WHERE Masoxetnghiem = '${req.body.Masoxetnghiem}'`;
  connection.query(query, (err, results) => {
    if (err) {
      throw err;
    }
    if (results[0].count === 0) {
        let query1 = connection.query(sql,data,(err,results) =>{
        alert("Thêm Xét nghiệm sĩ thành công");
        res.redirect('/test');
        });        
    } else {
      alert('Mã số xét nghiệm đã tồn tại trong hệ thông');
    }
  });
});

// Sửa khám bệnh
router.get('/test-update/:Masoxetnghiem', function(req, res) {
  let Masoxetnghiem = req.params.Masoxetnghiem;
  let sql_patient =  "SELECT CMND FROM BENHNHAN"
  let data_patient ="";
  let query_patient = connection.query(sql_patient,(err,rows) => {
    if(err) throw err;
    data_patient = rows
  });

  let sql_doctor =  "SELECT Donvilaymau FROM BACSI"
  let data_doctor ="";
  let query_doctor = connection.query(sql_doctor,(err,rows) => {
    if(err) throw err;
    data_doctor = rows
  });

  let sql = `SELECT * FROM BS_XN_BN where Masoxetnghiem = '${Masoxetnghiem}'`;
  let query = connection.query(sql,(err,result) => {
    if(err) throw err;
    let date = moment(result[0].Ngaylaymau).format('YYYY-MM-DD');
    res.render('test-update', { test:result[0],
                                date:date,
                                patient:data_patient,
                                doctor: data_doctor
                              });
  });
});

// Cập nhật sửa dữ liệu vào MYSQL

router.post('/test-update', function(req, res) {
  let date = moment(req.body.Ngaylaymau).format('YYYY-MM-DD');
  let Masoxetnghiem = req.body.Masoxetnghiem;
  let CMND= req.body.CMND;
  let Donvilaymau= req.body.Donvilaymau;
  let Loaixetnghiem= req.body.Loaixetnghiem;
  let Benhphamthuthap= req.body.Benhphamthuthap;
  let Lanxetnghiem= req.body.Lanxetnghiem;
  let Tinhtrangmau= req.body.Tinhtrangmau;
  let Ngaylaymau= date;
  let Ketquaxetnghiem= req.body.Ketquaxetnghiem;

  let sql = `UPDATE BS_XN_BN SET CMND = '${CMND}',
                                Donvilaymau = '${Donvilaymau}',
                                Loaixetnghiem = '${Loaixetnghiem}',
                                Benhphamthuthap = '${Benhphamthuthap}',
                                Lanxetnghiem = '${Lanxetnghiem}',
                                Tinhtrangmau = '${Tinhtrangmau}',
                                Ngaylaymau = '${Ngaylaymau}',
                                Ketquaxetnghiem = '${Ketquaxetnghiem}'
                                WHERE Masoxetnghiem = '${Masoxetnghiem}'
            `
  let query = connection.query(sql, function(error, results) {
    if (error) throw error;
    alert("Sửa xét nghiệm thành công");
    res.redirect('/test');
  });
});

// xoá Xét nghiệm
router.get('/test-delete/:Masoxetnghiem', function(req, res) {
  const Masoxetnghiem = req.params.Masoxetnghiem;
  let sql = `DELETE  FROM BS_XN_BN where Masoxetnghiem = '${Masoxetnghiem}'`;
  let query = connection.query(sql,(err,result) => {
    if(err) throw err;
    res.redirect('/test');
  });
});

// tìm kiếm theo CMND
router.post('/search-CMND', function(req, res) {
  let CMND = req.body.CMND;
  console.log('CMND la:', CMND)
  let sql_patient =  "SELECT CMND FROM BENHNHAN"
  let data_patient ="";
  let query_patient = connection.query(sql_patient,(err,rows) => {
    if(err) throw err;
    data_patient = rows
  });
// lấy tất cả rows của Bacsi table
  let sql_doctor =  "SELECT Donvilaymau FROM BACSI"
  let data_doctor ="";
  let query_doctor = connection.query(sql_doctor,(err,rows) => {
    if(err) throw err;
    data_doctor = rows
  });
  let query = "SELECT * FROM BS_XN_BN JOIN BACSI on BS_XN_BN.Donvilaymau = BACSI.Donvilaymau  JOIN BENHNHAN on BS_XN_BN.CMND = BENHNHAN.CMND WHERE BS_XN_BN.CMND LIKE '%" + CMND + "%'";
    connection.query(query, function(err, rows) {
      if (err) {
        console.log(err);
      } else {
        console.log(rows);

        res.render('test', {test:rows,doctor:data_doctor,patient:data_patient});
      }
    });
});

// tìm kiếm theo Hovaten
router.post('/search-name', function(req, res) {
  let name = req.body.Hovaten;
  console.log('name la:', name)
  let sql_patient =  "SELECT CMND FROM BENHNHAN"
  let data_patient ="";
  let query_patient = connection.query(sql_patient,(err,rows) => {
    if(err) throw err;
    data_patient = rows
  });
// lấy tất cả rows của Bacsi table
  let sql_doctor =  "SELECT Donvilaymau FROM BACSI"
  let data_doctor ="";
  let query_doctor = connection.query(sql_doctor,(err,rows) => {
    if(err) throw err;
    data_doctor = rows
  });
  let query = "SELECT * FROM BENHNHAN JOIN BS_XN_BN on BENHNHAN.CMND = BS_XN_BN.CMND  WHERE BENHNHAN.Hovaten LIKE '%" + name + "%'";
    connection.query(query, function(err, rows) {
      if (err) {
        console.log(err);
      } else {
        console.log(rows);

        res.render('test', {test:rows,doctor:data_doctor,patient:data_patient});
      }
    });
});

// in thông tin khám bệnh
router.get('/test-print/:Masoxetnghiem', function(req, res) {
  let Masoxetnghiem = req.params.Masoxetnghiem;
  
  let sql = `SELECT * FROM BS_XN_BN LEFT JOIN BACSI on BS_XN_BN.Donvilaymau = BACSI.Donvilaymau  LEFT JOIN BENHNHAN on BS_XN_BN.CMND = BENHNHAN.CMND WHERE Masoxetnghiem =  '${Masoxetnghiem}'`;
  let query = connection.query(sql,(err,result) => {
    if(err) throw err;
    console.log(result[0]);
    let birth_date = moment(result[0].Ngaythangnamsinh).format('DD-MM-YYYY');
    let date = moment(result[0].Ngaylaymau).format('DD-MM-YYYY');
    let dateParts = date.split('-');
    let day = dateParts[0];
    let month = dateParts[1];
    let year = dateParts[2];

    res.render('test-print', {test:result[0],
                              birth_date:birth_date,
                              date:date,
                              day:day,
                              month:month,
                              year:year
                            });
  });
});

module.exports = router;
