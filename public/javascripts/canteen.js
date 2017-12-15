$(document).ready(function () {
  function addDishNum(id){
    let $value = $('span#d-' + id);
    let num = parseInt($value.text()) + 1;
    if(num==1){
      let data = {
        id: id
      }
      $.ajax({
        type:'GET',
        url:'/api/dish',
        data:data,
        success:function(s){
          console.log(s);
          let $shopping=$('.shopping.contents');
          $shopping.append('<div class="ui clearing segment"></div>');
          let $last=$('.shopping .segment').last();
          $last.append(s.dish_name);
          $last.append('<span id="sp-'+s.id+'" style="text-align: center;width: 30px;color:rgb(255, 0, 0); font-size:17px;float:right;">￥'+s.price+'</span>');
          $last.append('<i id="si-'+s.id+'" class="ui add mini icon" style="float:right;line-height: 1.5;"></i>');
          $last.append('<span id="sn-'+s.id+'" style="text-align: center;width: 30px;color:#aaa; font-size:17px;float:right;">1</span> ');
          $last.append('<i id="si-'+s.id+'" class="ui minus mini icon" style="float:right;line-height: 1.5;"></i>');
        }
      })
    }
    $value.text(num);
    $('span#c-' + id).text(num);
    if(num!=1) {
      $('span#sn-'+id).text(num);
      let $price=$()
    }
    $('span#c-' + id).css('display', 'inline-block');
    $('.actions button.minus#b-' + id).css('display', 'inline-block');
    $('i.minus#cb-' + id).css('display', 'inline-block');
    $value.css('display', 'inline-block');
  }
  function minusDishNum(id){
    let $value = $('span#d-' + id);
    $value.text(parseInt($value.text()) - 1);
    if (parseInt($value.text()) == 0) {
      $('.actions button.minus#b-' + id).css('display', 'none');
      $('i.minus#cb-' + id).css('display', 'none');
      $('span#c-' + id).css('display', 'none');
      $value.css('display', 'none');
    }
  }


  $('.ui.rating').rating('disable');
  $('.menu .item').tab();
  $('.ui.sticky').sticky({
    context: '#canteen'
  });

  $('.actions button.add').click(function () {
    let id = $(this).attr('id').substring(2);
    addDishNum(id);
  });
  $('.container i.add').click(function () {
    let id = $(this).attr('id').substring(3);
    addDishNum(id);
  });
  $('.actions button.minus').click(function () {
    let id = $(this).attr('id').substring(2);
    minusDishNum(id);
  });
  $('.container i.minus').click(function () {
    let id = $(this).attr('id').substring(3);
    minusDishNum(id);    
  });
})

function showDetail(id) {
  $('.ui.modal#' + id).modal('show');
}