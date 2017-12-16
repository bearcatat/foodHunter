var express = require('express');
var router = express.Router();
var mysql = require('../utils/mysql/index');

/* GET home page. */
router.get('/', function (req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  } else {
    mysql.getALL('canteen', (err, rows, headers) => {
      res.render('index', {
        rows: rows,
        user:req.session.user
      });
    })
  }
});

router.get('/login', function (req, res, next) {
  req.session.user=null;
  res.render('login');
})

router.post('/login', function (req, res, next) {
  let condition = req.body;
  mysql.find('student', condition, (err, rows, headers) => {
    if (err) {
      res.status(500).json('database error');
    } else if (rows.length == 0) {
      res.status(200).json({
        'url': '/registe'
      })
    } else {
      req.session.user = rows[0].nickname;
      req.session.userId=rows[0].id;      
      res.status(200).json({
        'url': '/'
      })
    }
  })
})

router.get('/registe', function (req, res, next) {
  res.render('registe', {
    title: 'Express'
  });
})
router.post('/registe', function (req, res, next) {
  let data = req.body;
  //console.log(data);
  mysql.insert('student', data, (err) => {
    if (err) {
      console.log(err);
      res.status(500).json('err')
    } else {
      console.log("success");
      req.session.user = data.nickname;
      req.session.userId=data.id;
      res.status(200).json('ok')
    }
  })
})

router.get('/info',function(req,res,next){
  let condition={
    id:req.session.userId
  };
  mysql.find('student',condition,(err,rows,headers)=>{
    if (err) {
      console.log(err);
      return res.status(500).json('database error');
    }
    console.log(rows)
    res.render('information',{
      user:req.session.user,
      userInfo:rows[0]        
    });
  })
})
router.post('/info',function(req,res,next){
  var data=req.body;
  mysql.updateById('student',data.id,data,(err)=>{
    if(err){
      console.log(err);
      res.status(500).json('err')
    }else{
      console.log("success");
      req.session.user = data.nickname;
      res.status(200).json('ok')
    }
  });
})

router.get('/canteen/:id',function(req,res,next){
  var condition={
    canteen_id:req.params.id
  }
  mysql.find('dish',condition,function(err,rows){
    if(err){
      console.log(err);
      return res.status(500).json('err');
    }
    res.render('canteen',{
      user:req.session.user,
      dish:rows
    });
  })
})

router.post('/canteen/:id',function(req,res,next){
  let data=req.body;
  data['guest_id']=req.session.userId;
  data['canteen_id']=req.params.id;
  //console.log(data);
  mysql.insertOrderlist(data,(err,rows)=>{
    if(err){
      console.log(err);
      res.status(500).json('err');
    }else{
      console.log(rows);
      res.status(200).json('ok');
    }
  })
  mysql.getALL('orderlist',(err,rows,fields)=>{
    console.log(rows);
  })
})


function getAllOrderlistInfo(condition,callback){
  mysql.findByOrder('orderlist',condition,{'order_status':1,'expect_time':-1},function(err,orows){
    if(err){
      return callback(err);
    }
    let len=orows.length;
    let orderlist=[];
    if(len){
      let i=0;
      orows.forEach(function(v){
        mysql.getOrderlistInfo(v.id,(err,data)=>{
          if(err){
            return callback(err);
          }
          orderlist.push(data);
          i++;
          if(i==len){
            return callback(null,orderlist);
          }
        })
      })
    }else{
      return callback(null,orderlist);
    }
  })
}

router.get('/reward',function(req,res,next){
  getAllOrderlistInfo({
    order_status:0
  },(err,orderlistsBefore)=>{
    if(err){
      console.log(err);
      return res.status(500).json('err');
    }
    getAllOrderlistInfo({
      courier_id:req.session.userId
    },(err,orderlistsAccept)=>{
      if(err){
        console.log(err);
        return res.status(500).json('err');
      }
      getAllOrderlistInfo({
        guest_id:req.session.userId
      },(err,orderlistsMine)=>{
        if(err){
          console.log(err);
          return res.status(500).json('err');
        }
        res.render('reward',{
          user:req.session.user,
          userId:req.session.userId,
          orderlistsBefore:orderlistsBefore,
          orderlistsAccept:orderlistsAccept,
          orderlistsMine:orderlistsMine        
        });
      })
    })
    //console.log(orderlistsBefore)

  })
})

router.put('/reward',function(req,res,next){
  let body=req.body;
  console.log(body); 
  mysql.updateById('orderlist',body.id,{
    order_status:parseInt(body.order_status),
    courier_id:req.session.userId
  },function(err){
    mysql.getOrderlistInfoBefore(body.id,(err,data)=>{
      if(err){
        console.log(err);
        res.status(500).json('err');
      }else{
        res.status(200).json(data);
      }
    })
  });

})

router.get('/api/dish',function(req,res,next){
  console.log(req.query);
  mysql.find('dish',req.query,(err,rows)=>{
    if(err){
      console.log(err);
      return res.status(500).json('err');
    }
    res.status(200).json(rows[0]);  
  })
})





module.exports = router;