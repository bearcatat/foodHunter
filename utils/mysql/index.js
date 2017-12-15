var mysql = require('mysql');
var conf = require('../../conf');
var pool = mysql.createPool(conf.mysql);

exports.getALL = function (tableName, callback) {
  pool.getConnection((err, connection) => {
      if (err) {
          return callback(err);
      }
      connection.query('select * from ??', [tableName],(err, res, fields) => {
          connection.release();
          if (err) {
              return callback(err);
          }
          let headers=fields.map(f=>f.name);
          callback(err,res,headers);
      })
  })
}

function generateConditionString(where,callback){
  let conditionStr=[],conditionArr=[];
  for(var i in where){
    conditionStr.push("?? = ?");
    conditionArr.push(i);
    conditionArr.push(where[i]);
  }
  callback(conditionStr.join(','),conditionArr);
}

exports.find=function(tableName,where,callback){
  pool.getConnection((err,connection)=>{
    if (err) {
      return callback(err);
    }
    generateConditionString(where,function(str,arr){
      // console.log(str);
      // console.log('select * from '+tableName+' where '+str);
      // console.log(arr);      
      connection.query('select * from '+tableName+' where '+str,arr,(err,res,fields)=>{
        connection.release();
        if (err) {
          return callback(err);
        }
        let headers=fields.map(f=>f.name);
        callback(null,res,headers);
      })    
    })
  })
}

function getUpdateStrById(tableName,id,data,callback){
  var str='update '+tableName+' set ';
  var strarr=[];
  var arr=[];
  for(var i in data){
    if(i=='id') continue;
    strarr.push('??=?');
    arr.push(i);
    arr.push(data[i]);
  }
  str+=strarr.join(',');
  str+=(' where id='+id);
  callback(str,arr);
}

exports.updateById=function(tableName,id,data,callback){
  pool.getConnection((err,connection)=>{
    if (err) {
      return callback(err.sqlState);
    }
    getUpdateStrById(tableName,id,data,(str,arr)=>{
      console.log(str);
      console.log(arr);
      connection.query(str,arr,(err,res,fields)=>{
        connection.release();
        if(err){
            console.log(err);
            return callback(err.sqlState);                
        } 
        console.log(res);
        callback(null,res);
      })
    })
  })
}

exports.insert=function(tableName,data,callback){
  pool.getConnection((err,connection)=>{
      if (err) {
          return callback(err.sqlState);
      }
      connection.query('insert into '+tableName+' set ?',data,(err,res)=>{
          connection.release();
          if(err){
              console.log(err);
              return callback(err.sqlState);                
          } 
          callback(null,res);
      })
  })
}

