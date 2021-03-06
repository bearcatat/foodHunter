$(document).ready(function(){
  $('.ui.form').form({
    fields:{
      nickname:['empty','maxLength[10]'],
      sex:['empty'],
      grade:['empty'],
      major:['empty','maxLength[10]'],
      dormitory:['empty','maxLength[10]'],
      phone_number : ['minLength[11]', 'empty','maxLength[11]']
    },
    onSuccess:function(e,fields){
      e.preventDefault();  
      console.log(fields);    
      $.ajax({
        type: 'POST',
        url: window.location.pathname,
        data: fields,
        success: function (s) {
          alert("修改成功");
          window.location=window.location.pathname;
        },
        error:function(s){
          alert("修改失败");
        }
      }) 
    }
  })
})