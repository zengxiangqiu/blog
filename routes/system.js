var express = require('express');
var fs = require('fs');
var router = express.Router();
var aside  = require('./aside.js');
var log = require('./log.js');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
var dateFormat = require('dateformat');

router.get('/swash',function(req,res,next){
    res.render('swash',{title:'Swash'});
});

router.get('/swash/log',async function(req, res, next){
    await Promise.all([
        log.getSwashLogAsync(''),
        aside.getAsideAsync()
    ]).then(array=>{
        res.render('log',{
            title:'Log',
            logRecords: array[0],
            asideContent:array[1]});
    })
});

router.get('/wq/log/:date',async function(req, res, next){
    var logs = await log.getWQLog(req.params.date);
    var date = req.params.date;
    var dateStr = date.substring(0,4)+'-'+date.substring(4,6)+'-'+date.substring(6,8)
    res.render('wq',{title:'WQLog',logRecords: logs,date:dateStr});
    //var logs = getWQLog

});

router.get('/imaster/picture/log/:date', function(req, res, next){
    var date = req.params.date;
    var dateStr = date.substring(0,4)+'-'+date.substring(4,6)+'-'+date.substring(6,8)
    fs.readFile('uploads/logfile'+date, (err, data) => {
    if (err) 
    {
        res.send('Nothing Found');
    }
    else
    {
    var content = data.toString();
    res.render('imaster_picture',{title:'IMasterPicture',date:dateStr,articleContent: content});
    }
    });
});


router.post('/log/upload',upload.single('log'),function(req,res, next){
    var tmp_path = req.file.path;   
    var day=dateFormat(new Date(), "yyyymmdd"); 
    var target_path = 'uploads/'+req.file.originalname+day;
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        fs.unlink(tmp_path, function() {
           if (err) throw err;
           res.send({state:"1", msg:''});
        });
    });
})

module.exports = router;
