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

function getOrderStr(order,callback){
  let str=' ORDER BY ';
  let arr=[];
  for(let i in order){
    if(order[i]==-1){
      arr.push(i+' desc');
    }else{
      arr.push(i+ ' ASC');
    }
  }
  str+=arr.join(',');
  callback(str);
}

exports.findByOrder=function(tableName,where,order,callback){
  pool.getConnection((err,connection)=>{
    if (err) {
      return callback(err);
    }
    generateConditionString(where,function(str,arr){
      // console.log(str);
      // console.log('select * from '+tableName+' where '+str);
      // console.log(arr);
      getOrderStr(order,function(orderStr){
        connection.query('select * from '+tableName+' where '+str+orderStr,arr,(err,res,fields)=>{
          connection.release();
          if (err) {
            return callback(err);
          }
          let headers=fields.map(f=>f.name);
          callback(null,res,headers);
        })  
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
        //console.log(res);
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

exports.insertOrderlist=function(data,callback){
  pool.getConnection((err,connection)=>{
    if(err){
      return callback(err.sqlState);
    }
    connection.query('call add_orderlist(?,?,?,?,?,?)',[
      data.guest_id,
      data.canteen_id,
      data.shopping_cart,
      data.fee,
      data.location,
      parseInt(data.expect_time)
    ],(err,res,fields)=>{
      connection.release();      
      if(err){
        return callback(err.sqlState);
      }
      callback(null,res);
    })
  })
}

function getShoppingCart(shopping_cart,callback){
  let len=0;
  for(var i in shopping_cart)
    len++;
  let count=0;
  let data={};
  for(var i in shopping_cart){
    exports.find('dish',{
      id:parseInt(i)
    },(err,res)=>{
      if(err){
        return callback(err);
      }
      data[res[0].dish_name]=shopping_cart[i];
      count++;
      if(count==len){
        callback(null,data);
      }
    })
  }
}

exports.getOrderlistInfoBefore=function(id,callback){
  //console.log(id);
  exports.find('orderlist',{id:id},(err,ores)=>{
    if(err){
      return callback(err.sqlState);
    }
    exports.find('student',{id:ores[0].guest_id},(err,sres)=>{
      if(err){
        return callback(err.sqlState);
      }
      exports.find('canteen',{id:ores[0].canteen_id},(err,cres)=>{
        if(err){
          return callback(err.sqlState);
        }
        getShoppingCart(JSON.parse(ores[0].shopping_cart),(err,dish)=>{
          if(err){
            return callback(err.sqlState);
          }
          let data={
            id:ores[0].id,
            guest_id:ores[0].guest_id,
            guest_name:sres[0].nickname,
            canteen_name:cres[0].canteen_name,
            shopping_cart:dish,
            order_time:ores[0].order_time,
            fee:ores[0].fee,
            location:ores[0].location,
            expect_time:ores[0].expect_time,
            order_status:ores[0].order_status,
            courier_id:ores[0].courier_id
          }
          callback(err,data);
        });
      })
    })
  })
}
exports.getOrderlistInfo=function(id,callback){
  exports.getOrderlistInfoBefore(id,(err,data)=>{
    if(err){
      return callback(err.sqlState);
    }
    if(data.order_status==1||data.order_status==2){
      console.log(data.courier_id);
      exports.find('student',{
        id:data.courier_id
      },(err,res)=>{
        if(err){
          console.log(err);
          return callback(err.sqlState);
        }
        data['courier_name']=res[0].nickname;
        callback(null,data);
      })
    }else{
      callback(null,data);      
    }
  })
}

