$(document).ready(function(){
  $('.ui.form').form({
    fields:{
      id : ['minLength[10]', 'empty','maxLength[10]'],
      nickname:['empty','maxLength[10]'],
      sex:['empty'],
      grade:['empty'],
      major:['empty','maxLength[10]'],
      dormitory:['empty','maxLength[10]'],
      phone_number : ['minLength[11]', 'empty','maxLength[11]']
    },
    onSuccess:function(e,fields){
      e.preventDefault();      
      $.ajax({
        type: 'POST',
        url: window.location.pathname,
        data: fields,
        success: function (s) {
          console.log('kk')
          window.location=window.location.origin;
        }
      })
    }
  })
})