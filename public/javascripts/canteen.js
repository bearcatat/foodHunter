$(document).ready(function () {
  function addDishNum(id) {
    let $value = $('span#d-' + id);
    let num = parseInt($value.text()) + 1;
    if (num == 1) {
      let data = {
        id: parseInt(id)
      }
      $.ajax({
        type: 'GET',
        url: '/api/dish',
        data: data,
        success: function (s) {
          // console.log(s);
          let $shopping = $('.shopping.contents');
          $shopping.append('<div class="ui clearing segment"></div>');
          let $last = $('.shopping .segment').last();
          $last.append(s.dish_name);
          $last.append('<span id="sp-' + s.id + '" style="text-align: center;width: 30px;color:rgb(255, 0, 0); font-size:17px;float:right;">￥' + s.price + '</span>');
          $last.append('<i id="si-' + s.id + '" class="ui add mini icon shopping" style="float:right;line-height: 1.5;"></i>');
          $last.append('<span class="dish num"id="sn-' + s.id + '" style="text-align: center;width: 30px;color:#aaa; font-size:17px;float:right;">1</span> ');
          $last.append('<i id="si-' + s.id + '" class="ui minus mini icon shopping" style="float:right;line-height: 1.5;"></i>');
          let $money = $('.summary.money');
          let money = parseInt($money.text());
          $money.text(money + s.price);
          $('.shopping i.add').click(function(){
            let id = $(this).attr('id').substring(3);
            addDishNum(id);    
          })
          $('.shopping i.minus').click(function(){
            let id = $(this).attr('id').substring(3);
            minusDishNum(id);    
          })
        }
      })
    }
    $value.text(num);
    $('span#c-' + id).text(num);
    if (num != 1) {
      $('span#sn-' + id).text(num);
      let price = parseInt($('span#sp-'+id).text().substring(1));
      let $money = $('.summary.money');      
      let money = parseInt($money.text());
      $money.text(money + price);
    }
    $('span#c-' + id).css('display', 'inline-block');
    $('.actions button.minus#b-' + id).css('display', 'inline-block');
    $('i.minus#cb-' + id).css('display', 'inline-block');
    $value.css('display', 'inline-block');
    let $snum = $('.summary.num');      
    let snum = parseInt($snum.text());
    $snum.text(snum+1);
  }

  function minusDishNum(id) {
    let $value = $('span#d-' + id);
    let num=parseInt($value.text())-1;
    $value.text(num);
    $('span#c-'+id).text(num);
    $('span#sn-' + id).text(num);
    let price = parseInt($('span#sp-'+id).text().substring(1));
    let $money = $('.summary.money');      
    let money = parseInt($money.text());
    $money.text(money - price);
    if (parseInt($value.text()) == 0) {
      $('.actions button.minus#b-' + id).css('display', 'none');
      $('i.minus#cb-' + id).css('display', 'none');
      $('span#c-' + id).css('display', 'none');
      $value.css('display', 'none');
      $('span#sn-' + id).parent().remove();
    }
    let $snum = $('.summary.num');      
    let snum = parseInt($snum.text());
    $snum.text(snum-1);
  }

  $('.ui.rating').rating();    
  $('.ui.dish.rating').rating('disable');
  $('.ui.sticky').sticky({
    context: '#canteen'
  });

  $('.actions button.add').click(function () {
    let id = $(this).attr('id').substring(2);
    addDishNum(id);
  });
  $('.dish i.add').click(function () {
    let id = $(this).attr('id').substring(3);
    addDishNum(id);
  });
  $('.actions button.minus').click(function () {
    let id = $(this).attr('id').substring(2);
    minusDishNum(id);
  });
  $('.dish i.minus').click(function () {
    let id = $(this).attr('id').substring(3);
    minusDishNum(id);
  });

  $('.comment.item').click(function(){
    let id=$(this).attr('data-id');
    let load=parseInt($(this).attr('data-load'));
    if(load==0){
      addComments(parseInt(id));      
      $(this).attr('data-load',1);
    }
  })

})

function showDetail(id) {
  $('.ui.modal#' + id).modal('show');
  $('.ui.modal#' + id+' .menu .item').tab();
  
}

function summit(){
  let $money = $('.summary.money');
  let money = parseInt($money.text());
  if(money==0) return;
  let $shopping=$('.dish.num');
  let data={};
  $shopping.each(function(index,v){
    let $num=$(v);
    let id=$num.attr('id').substring(3);
    let num=parseInt($num.text());
    data[id]=num;
  });
  console.log(data);
  $('.ui.summit.modal').modal({
    closable:false,
    onCancel:function(){
    },
    onApprove:function(){
      let $form=$('.ui.dish.form').form({
        fields:{
          fee:'empty',
          location:'empty',
          expect_time:'empty'
        },
        onSuccess:function(e,f){
          f['shopping_cart']=JSON.stringify(data);
          $.ajax({
            type:'POST',
            url:window.location.pathname,
            data:f,
            success:function(s){
              console.log(s);
              window.location='/';
            }
          })
        }
      })
      if($form.form('is valid')){
        $form.form('validate form');        
      }
      return false;
    }
  }).modal('show');
}
function onSummitComment(id){
  let text=$('.ui.comment.form#co-'+id).form('get values');
  let score=$('.ui.comment.rating#so-'+id).rating('get rating');
  if(text.text==""||score==0){
    alert('请填写评论或评分');
    return;
  }
  $.ajax({
    type:'post',
    url:'/api/comment',
    data:{
      dish_id:id,
      content:text.text,
      score:score
    },
    success:function(s){
      console.log(s);
      $('#'+id+' .comments').append(`
      <div class="comment">
        <div class="content">
          <a class="author">`+s.userName+`</a>
          <div class="metadata">
            <div data-rating="`+score+`" data-max-rating="5" class="ui small star rating"></div>
            <span class="date">`+new Date().toLocaleString()+`</span>
            <a class="like">
              <i class="like icon" data-id="`+id+`" style="cursor:pointer;"></i> <label>0</label> Likes              
            </a>
          </div>
          <div class="text">`+
            text.text
          +`</div>
        </div>
      </div>
      `);
      $('.ui.comment.form#co-'+id).form("set value",'text','');
      $('.ui.comment.rating#so-'+id).rating('set rating',0); 
      $('.metadata .ui.rating').rating('disable'); 
      clickLikes();               
    }
  })
}

function addComments(id){
  console.log(id);
  $.ajax({
    type:'get',
    url:'/api/comment',
    data:{
      dish_id:id
    },
    success:function(s){
      console.log(s);
      let len=s.length,count=0;
      function loop(i){
        if(i==len){
          $('.metadata .ui.rating').rating('disable');
          clickLikes();
          return;
        }
        v=s[i];        
        $.ajax({
          type:'get',
          url:'/api/like',
          data:{
            comment_id:v.id
          },
          success:function(like){
            $('#'+id+' .comments').append(`
              <div class="comment">
                <div class="content">
                  <a class="author">`+v.student_name+`</a>
                  <div class="metadata" style="width:100%;">
                    <div data-rating="`+v.score+`" data-max-rating="5" class="ui small dish star rating"></div>
                    <span class="dat">`+new Date(v.time).toLocaleDateString()+`</span>
                    <a class="like"  style="float:right;">
                      <i class="like `+(parseInt(like)==0?'':'red')+` icon" data-id="`+v.id+`" style="cursor:pointer;"></i> <label>`+v.likes+`</label> Likes
                    </a>
                  </div>
                  <div class="text">
                  `+v.content+`
                  </div>
                </div>
              </div>
            `)
            loop(i+1);
          }
        })
      }
      loop(0);
    }
  })
}

function clickLikes(){
  $('.like.icon').unbind('click');
  $('.like.icon').click(function(){
    let id=$(this).attr('data-id');
    var that=this;
    var add=!($(that).hasClass('red'));
    console.log(id);
    $.ajax({
      type:(!add?'delete':'post'),
      url:'/api/like',
      data:{
        comment_id:id
      },
      success:function(s){
        $(that).toggleClass('red');
        let $like=$(that).next();
        let like=parseInt($like.text());
        if(add){
          $like.text(like+1);
        }else{
          $like.text(like-1);
        }
      }
    })
  })
}
