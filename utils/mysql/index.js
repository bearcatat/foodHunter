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
  callback(conditionStr.join(' and '),conditionArr);
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

exports.delete=function(tableName,where,callback){
  pool.getConnection((err,connection)=>{
    if (err) {
      return callback(err);
    }
    generateConditionString(where,function(str,arr){     
      connection.query('delete from '+tableName+' where '+str,arr,(err,res,fields)=>{
        connection.release();
        callback(err,res);
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
    let time=new Date();
    let now=new Date(time.getFullYear(),time.getMonth(),time.getDate(),time.getHours(),time.getMinutes(),time.getSeconds(),0);
    connection.query('call add_orderlist(?,?,?,?,?,?)',[
      data.guest_id,
      data.canteen_id,
      data.fee,
      data.location,
      parseInt(data.expect_time),
      now,
    ],(err,res,fields)=>{
      if(err){
        return callback(err.sqlState);
      }
      console.log(res);
      callback(null,res);
      connection.query('select * from orderlist where guest_id = ? and order_time= ?',[data.guest_id,now],(err,ores,fields)=>{
        connection.release();
        let orderlistId=ores[0]['id'];
        console.log(ores);
        
        let shoppingcart=JSON.parse(data['shopping_cart']);
        for(let s in shoppingcart){
          exports.find('dish',{id:parseInt(s)},(err,dres)=>{
            console.log(dres[0].price);
            if(err){
              console.log(err);
            }
            let shoppingData={
              order_id:orderlistId,
              dish_id:parseInt(s),
              quantity:shoppingcart[s],
              price:dres[0].price
            }
            exports.insert('shoppingcart',shoppingData,(err,isres)=>{
              if(err){
                console.log(err);
              }
            });
          })
        }
      })
    })
  })
}


function getShoppingCart(id,callback){
  // let len=0;
  // for(var i in shopping_cart)
  //   len++;
  // let count=0;
  // let data={};
  // for(var i in shopping_cart){
  //   exports.find('dish',{
  //     id:parseInt(i)
  //   },(err,res)=>{
  //     if(err){
  //       return callback(err);
  //     }
  //     data[res[0].dish_name]=shopping_cart[i];
  //     count++;
  //     if(count==len){
  //       callback(null,data);
  //     }
  //   })
  // }
  pool.getConnection((err,connection)=>{
    if(err){
      return callback(err);
    }
    connection.query('call getDishInfo(?)',[id],(err,res)=>{
      connection.release();
      if(err){
        console.log(err);
        return callback(err);        
      }
      let data={};
      let len=res[0].length;
      let i=0;
      if(len){
        res[0].forEach(function(r){
          data[r.dishName]=r.qty;
          i++;
          if(len==i){
            console.log(data);
            return callback(null,data);
          }
        });
      }else{
        return callback(null,{});        
      }      
    })
  })
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
        getShoppingCart(id,(err,dish)=>{
          if(err){
            return callback(err.sqlState);
          }
          //console.log(dish);
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
      //console.log(data.courier_id);
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

exports.getCommentsByDishId=function(dish_id,callback){
  pool.getConnection((err,connection)=>{
    if (err) {
      return callback(err.sqlState);
    }
    connection.query('call getCommentInfo(?)',[parseInt(dish_id)],(err,res,fields)=>{
      connection.release();
      if(err){
        return callback(err.sqlState);
      }
      callback(null,res[0]);
    })
  })
}




