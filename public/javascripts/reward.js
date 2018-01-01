$(document).ready(function(){
  $('.menu .item').tab();
  acceptOrderList();  
  mineOrderList();
  $('.orderlist.before button').click(function(){
    let id=$(this).attr('data-id');
    let that=this;
    console.log(id);
    $('.ui.before.modal#m-' + id).modal({
      //closable:false,
      onApprove:function(){
        let id=$(this).attr('data-id');
        $.ajax({
          type:'put',
          url:window.location.pathname,
          data:{
            id:parseInt(id),
            order_status:1
          },
          success:function(s){
            console.log(s);
            $('#l-'+id).remove();
            $(that).remove();
            $('.accept.segments').prepend(`
              <div class="ui orderlist accept segment" id="ao-`+id+`" data-id="`+id+`">
                <div class="header">悬赏人：`+s.guest_name+` <span>`+new Date(s.order_time).toLocaleString()+`</span><span style="float:right; color:red;width:5rem;text-align: center;">悬赏金</span></div>
                <p style="float:right; color:red;width:5rem;text-align: center;margin:0;">`+s.fee+`</p>
                <p style="margin:0;"> 期望时间：`+new Date(s.expect_time).toLocaleString()+`</p>                                      
                <div class="content">
                  <button data-id="`+id+`" class="ui red basic mini button" style="float:right;margin-left:1rem;">详情</button>                             
                  <p style="margin:0;">饭堂：`+s.canteen_name+`</p>   
                </div>   
              </div>
            `);
            let str="";
            for(let i in s.shopping_cart){
              str+='<p style="margin-left:1rem;"> '+i+':'+s.shopping_cart[i]+'</p>'
            }
            $('body').append(`
              <div class="ui accept modal" id="a-`+id+`"  data-id="`+id+`">
                <i class="close icon"></i>
                <div class="header">
                  委托人：`+s.guest_name+`
                </div>
                <div class="content">
                  <div class="description" style="margin:3rem;">
                    <p>饭堂：`+s.canteen_name+`</p>
                    <p>委托时间：`+new Date(s.order_time).toLocaleString()+`</p>
                    <p>赏金：`+s.fee+`</p>
                    <p>期望时间：`+new Date(s.expect_time).toLocaleString()+`</p> 
                    <p>菜单</p>`
                    +str+
                  `</div>  
                </div>
                <div class="actions"> 
                  <div class="ui red cancel inverted accept button button" data-id="`+id+`">
                    <i class="remove icon"></i>
                    取消
                  </div> 
                  <div class="ui green ok inverted positive button" style="margin-right:5.5rem" data-id="`+id+`">
                    <i class="checkmark icon"></i>
                    接受
                  </div>
                </div>
              </div>
            `)
            acceptOrderList();
          }
        })
      }
    }).modal('show');
  })
})

function acceptOrderList(){
  $('.accept.segments button').click(function(){
    let aid=$(this).attr('data-id');
    let data=
    $('.ui.accept.modal#a-'+aid).modal({
     // closable:false,
      onApprove:function(){
        $.ajax({
          type:'put',
          url:window.location.pathname,
          data:{
            id:parseInt(aid),
            order_status:2
          },
          success:function(s){
            $('#a-'+aid+' .actions').empty();
            $('#a-'+aid+' .actions').append("已完成");            
          }
        })
      },
      onDeny:function(){
        $.ajax({
          type:'put',
          url:window.location.pathname,
          data:{
            id:parseInt(aid),
            order_status:4
          },
          success:function(s){
            $('#a-'+aid+' .actions').empty();
            $('#a-'+aid+' .actions').append("你放弃了悬赏");            
          }
        })
      }
    }).modal('show');
  })
}

function mineOrderList(){
  $('.mine.segments button').click(function(){
    let aid=$(this).attr('data-id');
    let data=
    $('.ui.mine.modal#mm-'+aid).modal({
     // closable:false,
      onDeny:function(){
        $.ajax({
          type:'put',
          url:window.location.pathname,
          data:{
            id:parseInt(aid),
            order_status:3
          },
          success:function(s){
            $('#mm-'+aid+' .actions').empty();
            $('#mm-'+aid+' .actions').append("你放弃了悬赏");  
            $('#mm-'+aid+' .header').append("你放弃了悬赏");                                  
          }
        })
      }
    }).modal('show');
  })
}