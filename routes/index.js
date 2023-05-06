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
  let sql = `DELETE  FROM BENHNHAN where CMND = ${Patient_CMND}`;
  let query = connection.query(sql,(err,result) => {
    if(err) throw err;
    res.redirect('/');
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
  let sql = `DELETE  FROM BACSI where Donvilaymau = ${mysql.escape(Donvilaymau)}`;
  let query = connection.query(sql,(err,result) => {
    if(err) throw err;
    res.redirect('/doctor');
  });
});
module.exports = router;
