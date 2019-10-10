
var express = require('express');
var dateformat  = require('dateformat')
const sql = require('mssql');

const config = {
    server: '192.168.1.11',
    port : 1433,
    user: 'Program',
    password:'lstfgh0738',
    database:'lsj50',

    
}

const wqConfig = {
    server: '192.168.1.11',
    port : 1433,
    user: 'Program',
    password:'lstfgh0738',
    database:'ISys'
}

var getSwashLogAsync = async function(filter){
    var sqlStr = `SELECT  * FROM TBLSVCLOG --WHERE logKey = @key`;
    var paras = [];
    paras.push({
        key:'key',
        type:sql.VarChar,
        value: 'C0013102'
    });
    var result = await query(config,sqlStr,paras);

    return result; 
}

var query = async function(config,sqlStr, paras){
        try {
          var rows = await sql.connect(config).then(pool=>
            {
                var req =pool.request();
                paras.forEach(element => {
                    req.input(element.key,element.type, element.value);
                });
                var result = req.query(sqlStr);
                return result;
            }).then(result=>
            {
                return result.recordset;
            });
            sql.close();
            return rows;
        } catch (err) {
            // ... error checks
           console.log(err);
           sql.close();
        }    
}

var getWQLog = async function(date){
    var sqlStr = `SELECT  Date, Message FROM iSys.dbo.T_BUG_LOG WHERE CONVERT(varchar(15),[Date],112) = CONVERT(varchar(15),@dateStr,112) AND Logger = 'WQPOSTAUTO' ORDER BY Date`;
    var paras = [];
    paras.push({
        key:'dateStr',
        type:sql.VarChar,
        value: date
    });
    var result = await query(config,sqlStr,paras);
    result.forEach(element=>{
         element.Date = dateformat(element.Date.setHours(element.Date.getHours() -8 ),'yyyy-mm-dd hh:MM:ss');
    });

    return result; 
}

function detailFormatter(index, row) {
    var html = []
    $.each(row, function (key, value) {
      html.push('<p><b>' + key + ':</b> ' + value + '</p>')
    })
    return html.join('')
}
exports.getSwashLog = getSwashLogAsync;
exports.getWQLog = getWQLog;
